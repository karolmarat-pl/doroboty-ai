import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock("posthog-js/full/no-external", () => ({ default: sdk }));

beforeEach(() => {
  vi.resetModules();
  sdk.init.mockReset().mockReturnValue(sdk);
  sdk.capture.mockReset();
  vi.stubGlobal("window", { location: { origin: "https://prototype.example" } });
  vi.stubEnv("VITE_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("VITE_POSTHOG_HOST", "https://eu.i.posthog.com");
  vi.stubEnv("VITE_POSTHOG_ALLOWED_ORIGIN", "https://prototype.example");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("optional person-picker analytics", () => {
  it("records unmasked replay without borrowing autocapture exclusions and preserves snapshots", async () => {
    const { initializeAnalytics } = await import("./analytics");
    await initializeAnalytics();
    const options = sdk.init.mock.calls[0][1];
    expect(options.session_recording).toEqual(
      expect.objectContaining({
        blockSelector: undefined,
        blockClass: /$^/,
        maskAllInputs: false,
        maskInputOptions: { password: false },
        maskTextSelector: undefined,
        maskTextClass: /$^/,
        maskAllElementAttributes: false,
        recordHeaders: false,
        recordBody: false,
      }),
    );
    expect(
      options.session_recording.maskCapturedNetworkRequestFn({
        name: "https://private.example/secret",
      }).name,
    ).toBe("https://prototype.example/");
    const data = [{ type: 2, data: { textContent: "Synthetic scenario answer" } }];
    const result = options.before_send({
      event: "$snapshot",
      properties: {
        $snapshot_data: data,
        $session_id: "session",
        $current_url: "private",
        $referrer: "private",
      },
    });
    expect(result.properties.$snapshot_data).toBe(data);
    expect(result.properties.$session_id).toBe("session");
    expect(result.properties).not.toHaveProperty("$current_url");
    expect(result.properties).not.toHaveProperty("$referrer");
  });

  it("records initial, navigated and returned views once, including StrictMode initialization", async () => {
    const { trackPageview } = await import("./analytics");
    await Promise.all([trackPageview("/"), trackPageview("/")]);
    await trackPageview("/oferty");
    await trackPageview("/oferty");
    await trackPageview("/");
    expect(sdk.capture.mock.calls).toEqual([
      ["$pageview", { $pathname: "/" }],
      ["$pageview", { $pathname: "/oferty" }],
      ["$pageview", { $pathname: "/" }],
    ]);
  });

  it("filters pageviews to stable route templates without query, record IDs or free text", async () => {
    const { trackPageview } = await import("./analytics");
    await trackPageview("/app/kandydaci/synthetic-123/rozmowa");
    expect(sdk.capture).toHaveBeenLastCalledWith("$pageview", {
      $pathname: "/app/kandydaci/:id/rozmowa",
    });
    const filter = sdk.init.mock.calls[0][1].before_send;
    const result = filter({
      event: "$pageview",
      properties: {
        distinct_id: "anonymous",
        $session_id: "session",
        $pathname: "/oferty/synthetic-role?answer=secret#employer",
        $current_url: "https://prototype.example/?private=secret#/oferty/synthetic-role",
        $referrer: "https://private.example/secret",
        answer: "private answer",
      },
    });
    expect(result.properties).toEqual({
      token: "phc_test",
      distinct_id: "anonymous",
      $process_person_profile: false,
      $current_url: "https://prototype.example/#/oferty/:slug",
      $pathname: "/oferty/:slug",
      $session_id: "session",
      $ip: "0.0.0.0",
    });
    expect(
      filter({ event: "$pageview", properties: { $pathname: "/secret-text" } }).properties
        .$pathname,
    ).toBe("/not-found");
  });

  it("allows pageview retry after failed SDK startup", async () => {
    const { trackPageview } = await import("./analytics");
    sdk.init.mockImplementationOnce(() => {
      throw new Error("offline");
    });
    await expect(trackPageview("/")).resolves.toBeUndefined();
    await trackPageview("/");
    expect(sdk.capture).toHaveBeenCalledExactlyOnceWith("$pageview", { $pathname: "/" });
  });

  it.each([
    ["VITE_POSTHOG_PROJECT_TOKEN", ""],
    ["VITE_POSTHOG_HOST", ""],
    ["VITE_POSTHOG_HOST", "not-a-host"],
    ["VITE_POSTHOG_ALLOWED_ORIGIN", ""],
    ["VITE_POSTHOG_ALLOWED_ORIGIN", "https://another.example"],
    ["VITE_POSTHOG_ALLOWED_ORIGIN", "http://prototype.example"],
  ])("does not initialize or send with %s=%s", async (key, value) => {
    vi.stubEnv(key, value);
    const { trackPersonPickerClick, isAnalyticsEnabled } = await import("./analytics");
    expect(isAnalyticsEnabled()).toBe(false);
    await trackPersonPickerClick();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });

  it("is disabled on localhost even with production configuration", async () => {
    vi.stubGlobal("window", { location: { origin: "http://127.0.0.1:3106" } });
    const { trackPersonPickerClick } = await import("./analytics");
    await trackPersonPickerClick();
    expect(sdk.init).not.toHaveBeenCalled();
  });

  it("initializes once for concurrent clicks with masked autocapture and no persistence", async () => {
    const { trackPersonPickerClick } = await import("./analytics");
    await Promise.all([trackPersonPickerClick(), trackPersonPickerClick()]);
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledWith(
      "phc_test",
      expect.objectContaining({
        api_host: "https://eu.i.posthog.com",
        persistence: "memory",
        disable_persistence: true,
        person_profiles: "never",
        ip: false,
        autocapture: expect.objectContaining({
          css_selector_ignorelist: expect.arrayContaining([
            "input",
            "form",
            "[data-analytics-private]",
          ]),
        }),
        mask_all_text: true,
        mask_all_element_attributes: true,
        capture_pageview: false,
        capture_pageleave: false,
        capture_exceptions: false,
        disable_session_recording: false,
        advanced_disable_feature_flags: true,
        disable_external_dependency_loading: true,
      }),
    );
    expect(sdk.capture.mock.calls).toEqual([["person_picker_clicked"], ["person_picker_clicked"]]);
  });

  it("starts before a custom click and permits only structural autocapture metadata", async () => {
    const { initializeAnalytics } = await import("./analytics");
    await initializeAnalytics();
    expect(sdk.init).toHaveBeenCalledTimes(1);
    expect(sdk.capture).not.toHaveBeenCalled();
    const filter = sdk.init.mock.calls[0][1].before_send;
    const result = filter({
      event: "$autocapture",
      properties: {
        distinct_id: "anonymous",
        $event_type: "click",
        $input_value: "private answer",
        $current_url: "https://prototype.example/?private=secret",
        $elements: [
          {
            tag_name: "button",
            nth_child: 2,
            nth_of_type: 1,
            $el_text: "private",
            "attr:href": "secret",
          },
        ],
      },
    });
    expect(result.properties).toEqual({
      token: "phc_test",
      distinct_id: "anonymous",
      $process_person_profile: false,
      $current_url: "https://prototype.example/",
      $ip: "0.0.0.0",
      $event_type: "click",
      $elements: [{ tag_name: "button", nth_child: 2, nth_of_type: 1 }],
    });
  });

  it("drops automatic events and replaces enrichment with an exact allowlist", async () => {
    const { trackPersonPickerClick } = await import("./analytics");
    await trackPersonPickerClick();
    const filter = sdk.init.mock.calls[0][1].before_send;
    expect(filter({ event: "$exception", properties: { message: "private" } })).toBeNull();
    expect(filter(null)).toBeNull();
    const result = filter({
      event: "person_picker_clicked",
      properties: {
        distinct_id: "random-visit-id",
        $current_url: "https://prototype.example/?private=secret#/private",
        $referrer: "https://referrer.example/private",
        answer: "private answer",
        personId: "synthetic-person",
      },
    });
    expect(result.properties).toEqual({
      token: "phc_test",
      distinct_id: "random-visit-id",
      $process_person_profile: false,
      $current_url: "https://prototype.example/",
      $ip: "0.0.0.0",
      button_label: "Wybierz osobę",
      placement: "public_header",
    });
  });

  it("absorbs initialization and capture errors and allows retry", async () => {
    const { trackPersonPickerClick } = await import("./analytics");
    sdk.init.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    await expect(trackPersonPickerClick()).resolves.toBeUndefined();
    sdk.capture.mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    await expect(trackPersonPickerClick()).resolves.toBeUndefined();
    await expect(trackPersonPickerClick()).resolves.toBeUndefined();
    expect(sdk.capture).toHaveBeenCalledTimes(2);
  });
});
