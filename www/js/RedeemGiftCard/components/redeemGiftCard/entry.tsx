import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";

import "./src/main.css";
import "@rbx/payments/styles/redeemGiftCard/redeemGiftCard.scss";
import "@rbx/payments/styles/redeemGiftCard/convertCredit.scss";
import "@rbx/payments/styles/redeemGiftCard/giftCardCurrencyConversion.scss";
import { trackCriticalError } from "@rbx/payments/creditCheckout";
import App from "./src/App";

ready(() => {
  const rootElement = document.getElementById("redeem-gift-card-container");
  if (rootElement) {
    renderWithErrorBoundary(<App />, rootElement, undefined, undefined, error => {
      trackCriticalError("Error_ReactCrash", null, error);
    });
  }
});
