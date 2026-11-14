import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./features/prototype/app";
import { ErrorRecovery } from "./features/prototype/error-recovery";
import "./app/globals.css";
import { initializeAnalytics } from "./features/prototype/analytics";

void initializeAnalytics();

createRoot(document.getElementById("root")!, {
  onCaughtError: () => {
    // ErrorRecovery exposes only allowlisted diagnostic metadata, never error text.
  },
}).render(
  <StrictMode>
    <ErrorRecovery>
      <App />
    </ErrorRecovery>
  </StrictMode>,
);
