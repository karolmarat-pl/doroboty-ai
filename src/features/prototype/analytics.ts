import type { PostHog } from "posthog-js/dist/module.no-external";

let client: Promise<PostHog | undefined> | undefined;

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

export async function trackPersonPickerClick() {
  const config = configuration();
  if (!config) return;
  try {
    client ??= import("posthog-js/dist/module.no-external").then(({ default: posthog }) =>
      posthog.init(config.token, {
        api_host: config.host,
        defaults: "2026-08-30",
        persistence: "memory",
        disable_persistence: true,
        person_profiles: "never",
        ip: false,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_heatmaps: false,
        capture_exceptions: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        internal_or_test_user_hostname: null,
        request_batching: false,
        before_send: (event) => {
          if (!event || event.event !== "person_picker_clicked") return null;
          // Replace SDK enrichment: never send raw URLs, referrers, DOM or scenario data.
          event.properties = {
            distinct_id: event.properties.distinct_id,
            $process_person_profile: false,
            $current_url: `${config.origin}/`,
            $ip: "0.0.0.0",
            button_label: "Wybierz osobę",
            placement: "public_header",
          };
          return event;
        },
      }),
    );
    (await client)?.capture("person_picker_clicked");
  } catch {
    // Optional analytics must never interrupt navigation or expose exception text.
    client = undefined;
  }
}
