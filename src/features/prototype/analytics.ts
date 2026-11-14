import type { PostHog } from "posthog-js";

export const privateAnalyticsSelector =
  '[data-analytics-private], .ph-no-capture, .ph-no-autocapture, [data-ph-no-autocapture], input, textarea, select, form, [contenteditable], [role="textbox"], [role="dialog"], iframe, object, embed, canvas';

let client: Promise<PostHog | undefined> | undefined;
let lastPageviewPathname: string | undefined;

function pageviewPathname(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0];
  if (/^\/(oferty|firmy|aplikuj)\/[^/]+$/.test(path)) return path.replace(/\/[^/]+$/, "/:slug");
  if (/^\/auth\/[^/]+$/.test(path)) return "/auth/:mode";
  if (/^\/app\/(oferty|aplikacje|kandydaci)\/[^/]+(?:\/(wyslano|rozmowa))?$/.test(path))
    return path.replace(/^(\/app\/[^/]+)\/[^/]+/, "$1/:id");
  return [
    "/",
    "/oferty",
    "/metodologia",
    "/polityka-prywatnosci",
    "/app",
    "/app/onboarding",
    "/app/profil",
    "/app/profil/podglad",
    "/app/zapisane",
    "/app/aplikacje",
    "/app/oferty",
    "/app/organizacja",
    "/app/kandydaci",
    "/app/case",
    "/app/settings",
  ].includes(path)
    ? path
    : "/not-found";
}

function configuration() {
  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
  const host = import.meta.env.VITE_POSTHOG_HOST?.trim();
  const origin = import.meta.env.VITE_POSTHOG_ALLOWED_ORIGIN?.trim();
  if (
    typeof window === "undefined" ||
    !token ||
    host !== "https://eu.i.posthog.com" ||
    !origin?.startsWith("https://") ||
    window.location.origin !== origin
  )
    return;
  return { token, host, origin };
}

export function isAnalyticsEnabled() {
  return configuration() !== undefined;
}

export async function initializeAnalytics() {
  const config = configuration();
  if (!config) return;
  try {
    client ??= import("posthog-js/full/no-external").then(({ default: posthog }) =>
      posthog.init(config.token, {
        api_host: config.host,
        defaults: "2026-08-30",
        persistence: "memory",
        disable_persistence: true,
        person_profiles: "never",
        ip: false,
        autocapture: { css_selector_ignorelist: privateAnalyticsSelector.split(", ") },
        mask_all_text: true,
        mask_all_element_attributes: true,
        // HashRouter reports initial and subsequent views explicitly, without duplicates.
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_heatmaps: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: false,
        enable_recording_console_log: false,
        disable_capture_url_hashes: true,
        session_recording: {
          blockSelector: undefined,
          blockClass: /$^/,
          maskAllInputs: false,
          maskInputOptions: { password: false },
          maskTextSelector: undefined,
          maskTextClass: /$^/,
          maskAllElementAttributes: false,
          captureJsonLd: false,
          recordCrossOriginIframes: false,
          recordHeaders: false,
          recordBody: false,
          captureCanvas: { recordCanvas: false },
          maskCapturedNetworkRequestFn: () => ({
            name: `${config.origin}/`,
            duration: 0,
            entryType: "navigation",
            startTime: 0,
          }),
        },
        disable_surveys: true,
        disable_external_dependency_loading: true,
        advanced_disable_feature_flags: true,
        internal_or_test_user_hostname: null,
        request_batching: false,
        before_send: (event) => {
          if (!event) return null;
          // Preserve recorder snapshots verbatim; rewriting them would corrupt replay.
          if (event.event === "$snapshot") {
            const snapshot = event.properties;
            event.properties = Object.fromEntries(
              [
                "distinct_id",
                "$session_id",
                "$window_id",
                "$snapshot_data",
                "$snapshot_bytes",
                "$lib",
                "$lib_version",
              ]
                .filter((key) => snapshot[key] !== undefined)
                .map((key) => [key, snapshot[key]]),
            );
            event.properties.$ip = "0.0.0.0";
            event.properties.token = config.token;
            event.properties.$process_person_profile = false;
            return event;
          }
          if (
            ![
              "person_picker_clicked",
              "analytics_test_clicked",
              "$autocapture",
              "$pageview",
            ].includes(event.event)
          )
            return null;
          const original = event.properties;
          const pageview = event.event === "$pageview";
          const route = pageviewPathname(String(original.$pathname ?? ""));
          // Retain structural interaction metadata, never DOM text, attributes or scenario data.
          const interaction = event.event === "$autocapture";
          event.properties = {
            token: config.token,
            distinct_id: event.properties.distinct_id,
            $process_person_profile: false,
            $current_url: pageview ? `${config.origin}/#${route}` : `${config.origin}/`,
            $ip: "0.0.0.0",
            ...(original.$session_id ? { $session_id: original.$session_id } : {}),
            ...(original.$window_id ? { $window_id: original.$window_id } : {}),
            ...(pageview
              ? { $pathname: route }
              : interaction
                ? {
                    $event_type: ["click", "change", "submit"].includes(original.$event_type)
                      ? original.$event_type
                      : undefined,
                    $elements: Array.isArray(original.$elements)
                      ? original.$elements.map((element) => ({
                          tag_name: /^[a-z][a-z0-9-]*$/.test(element.tag_name)
                            ? element.tag_name
                            : undefined,
                          nth_child: Number.isInteger(element.nth_child)
                            ? element.nth_child
                            : undefined,
                          nth_of_type: Number.isInteger(element.nth_of_type)
                            ? element.nth_of_type
                            : undefined,
                        }))
                      : [],
                  }
                : event.event === "analytics_test_clicked"
                  ? { button_label: "Test PostHog", placement: "privacy_page" }
                  : { button_label: "Wybierz osobę", placement: "public_header" }),
          };
          return event;
        },
      }),
    );
    return await client;
  } catch {
    // Optional analytics must never interrupt navigation or expose exception text.
    client = undefined;
  }
}

export async function trackPageview(pathname: string) {
  try {
    const analytics = await initializeAnalytics();
    if (!analytics || lastPageviewPathname === pathname) return;
    analytics.capture("$pageview", { $pathname: pageviewPathname(pathname) });
    lastPageviewPathname = pathname;
  } catch {
    // Optional pageview delivery must not affect routing; a later view can retry.
    client = undefined;
  }
}

export async function trackAnalyticsTest() {
  try {
    const analytics = await initializeAnalytics();
    if (!analytics) return false;
    return Boolean(analytics.capture("analytics_test_clicked"));
  } catch {
    client = undefined;
    return false;
  }
}

export async function trackPersonPickerClick() {
  try {
    (await initializeAnalytics())?.capture("person_picker_clicked");
  } catch {
    client = undefined;
  }
}
