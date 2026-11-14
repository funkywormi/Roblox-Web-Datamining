// ObsErrorBoundary (not renderWithErrorBoundary) handles crashes, so render directly.
import { render } from "react-dom";
import ready from "@rbx/core-scripts/util/ready";
import { PaymentsTranslationProvider } from "@rbx/payments";
import { translations } from "./component.json";
import App from "./src/App";
import {
  reportPageLoad,
  reportPageView,
  ObsErrorBoundary,
  reportNoRoot,
} from "./src/observability";
import "./src/css/giftingProducts.scss";

const ROOT_ELEMENT_ID = "gifting-products-web-app";

ready(() => {
  reportPageLoad();

  const contentElement = document.getElementById("content");
  if (contentElement) {
    contentElement.classList.add("content-full-screen");
  }

  const rootElement = document.getElementById(ROOT_ELEMENT_ID);
  if (!rootElement) {
    reportNoRoot();
    return;
  }

  reportPageView();
  render(
    <ObsErrorBoundary>
      <PaymentsTranslationProvider config={translations} context="RobuxGifting">
        <App />
      </PaymentsTranslationProvider>
    </ObsErrorBoundary>,
    rootElement,
  );
});
