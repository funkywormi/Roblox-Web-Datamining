import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { PaymentsTranslationProvider } from "@rbx/payments";
import { translations } from "./component.json";
import App from "./src/App";
import { trackCounter, trackCriticalError } from "./src/observability";
import "./src/css/giftingProducts.scss";

const ROOT_ELEMENT_ID = "gifting-products-web-app";

function trackCrash(error: unknown) {
  trackCriticalError("Error_ReactCrash", null, error);
}

ready(() => {
  trackCounter("PageView");

  const contentElement = document.getElementById("content");
  if (contentElement) {
    contentElement.classList.add("content-full-screen");
  }

  const rootElement = document.getElementById(ROOT_ELEMENT_ID);
  if (!rootElement) {
    trackCriticalError("NoRoot", null);
    return;
  }

  renderWithErrorBoundary(
    <PaymentsTranslationProvider config={translations} context="RobuxGifting">
      <App />
    </PaymentsTranslationProvider>,
    rootElement,
    undefined,
    undefined,
    trackCrash,
  );
});
