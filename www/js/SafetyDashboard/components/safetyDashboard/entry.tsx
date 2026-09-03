import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import App from "./src/App";
import { translations } from "./component.json";
import { captureTrafficSourceAndFixUrl } from "./src/telemetry/captureTrafficSource";
import { handleViolationIDParam } from "./src/features/violations/util/handleIncomingLinks";
import { sendErrorEvent } from "./src/telemetry/appealsEvents";
import "./src/main.css";

/**
 * Handle `t_source` query param and fix the url. Run first so the traffic
 * source is captured before any telemetry event sends its `source`.
 */
captureTrafficSourceAndFixUrl();

/**
 * Handle `vid` query param and fix the url. Used when a user gets navigated
 * to a specific violation from outside the Account Status page.
 */
handleViolationIDParam();

ready(() => {
  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProvider config={translations}>
        <App />
      </TranslationProvider>
    </QueryClientProvider>,
    document.getElementById("safety-dashboard-web-app"),
    undefined,
    undefined,
    (error, componentStack) => {
      sendErrorEvent({
        errorType: "RenderError",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? (error.stack ?? "") : "",
        componentStack,
      });
    },
  );
});
