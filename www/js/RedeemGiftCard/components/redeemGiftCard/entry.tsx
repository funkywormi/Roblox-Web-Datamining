// ObsErrorBoundary (not renderWithErrorBoundary) handles crashes, so render directly.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render } from "react-dom";
import ready from "@rbx/core-scripts/util/ready";

import "./src/main.css";
import "@rbx/payments-legacy/styles/redeemGiftCard/redeemGiftCard.scss";
import "@rbx/payments-legacy/styles/redeemGiftCard/convertCredit.scss";
import "@rbx/payments-legacy/styles/redeemGiftCard/giftCardCurrencyConversion.scss";
import {
  reportPageLoad,
  reportPageView,
  ObsErrorBoundary,
  reportNoRoot,
} from "@rbx/payments/creditCheckout";
import App from "./src/App";

ready(() => {
  reportPageLoad();

  const rootElement = document.getElementById("redeem-gift-card-container");
  if (rootElement) {
    reportPageView();
    render(
      <ObsErrorBoundary name="Error_ReactCrash">
        <App />
      </ObsErrorBoundary>,
      rootElement,
    );
  } else {
    reportNoRoot();
  }
});
