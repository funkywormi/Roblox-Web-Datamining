import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "react-dom";
import { PaymentsTranslationProvider } from "@rbx/payments";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient } from "@rbx/core-scripts/react";
import pfas from "@rbx/core-scripts/payments-flow";
import { translations } from "./component.json";
import { ROOT_ELEMENT_ID } from "./src/constants";
import { App } from "./src/App";
import { useBuyRobuxPageData } from "./src/hooks/useBuyRobuxPageData";
import "./src/main.css";
import "./src/stylesheets/robuxRedesign.scss";
import "./src/stylesheets/styleGuidePatch.scss";
import { reportPageLoad, reportPageView, ObsErrorBoundary } from "./src/observability";
import { reportInteractive } from "./src/utils/publishMetric";

ready(() => {
  reportPageLoad();

  const buyRobuxPageData = useBuyRobuxPageData();
  if (!buyRobuxPageData) {
    return;
  }

  reportInteractive();
  reportPageView();

  // Set the payment flow UUID before React mounts so no child effect fires
  // a tracking event with a stale/random UUID (race condition fix).
  // Skipped for unauth — there's no purchase flow until the user signs in.
  if (buyRobuxPageData.purchaseFlowId) {
    pfas.setPaymentFlowUuid(buyRobuxPageData.purchaseFlowId);
  }

  render(
    <ObsErrorBoundary name="BuyRobuxPageReactCrash">
      <QueryClientProvider client={queryClient}>
        <PaymentsTranslationProvider config={translations} context="RobuxRedesign">
          <SystemFeedbackProvider>
            <App {...buyRobuxPageData} />
          </SystemFeedbackProvider>
        </PaymentsTranslationProvider>
      </QueryClientProvider>
    </ObsErrorBoundary>,
    document.getElementById(ROOT_ELEMENT_ID),
  );
});
