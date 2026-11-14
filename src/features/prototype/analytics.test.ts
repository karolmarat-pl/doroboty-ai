import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock("posthog-js/dist/module.no-external", () => ({ default: sdk }));

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

  it("initializes once for concurrent clicks with no automatic collection or persistence", async () => {
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
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_exceptions: false,
        disable_session_recording: true,
        advanced_disable_flags: true,
        disable_external_dependency_loading: true,
      }),
    );
    expect(sdk.capture.mock.calls).toEqual([["person_picker_clicked"], ["person_picker_clicked"]]);
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
