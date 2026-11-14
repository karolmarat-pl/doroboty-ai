# Prototype data boundary

This static frontend has no trusted server or real authentication. Role-specific UI and local transition checks organize the scenario; anyone using the browser can inspect all stored data. Use synthetic data only.

No API keys, credentials, real CVs or private material belong in frontend source, JSON, localStorage or exports. Exports include private-in-the-UI source/recruiter notes.

Render imported text through React text nodes, validate imports with shared Zod schemas, reject unsupported versions, duplicate IDs, broken references and oversized files. Never overwrite an unreadable save automatically.

## Runtime incident handling

Karol receives participant reports at karolmarat@gmail.com and decides on repairs. Diagnostic JSON is generated only in memory and downloaded on request: code, timestamp and random reference only. Raw exceptions/rejection reasons are not read, persisted or transmitted by recovery handlers; default reporting of handled events is suppressed. Email submission is manual. There is no remote logging account or telemetry access to configure in this prototype.

First response: ask which action failed and whether restarting helps, without requesting real data. Preserve the browser save before any reset. If the page never loads, check the address/network and whether another participant can load it; the recovery code cannot diagnose a missing bundle or hosting outage. If only one saved scenario fails, reproduce on isolated synthetic data and preserve the original. Stop the affected exercise if saving or the main journey is broken. Hosting access and provider-specific rollback remain to be established before release.
