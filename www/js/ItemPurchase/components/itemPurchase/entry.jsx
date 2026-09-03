import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import RobloxItemPurchase, {
  PriceContainer,
} from "@rbx/purchase-common/js/react/itemPurchase/itemPurchase";
import "@rbx/purchase-common/src/css/itemPurchase/itemPurchase.scss";
import "@rbx/purchase-common/src/css/tailwind.css";

// Deployable Static Content Component for ItemPurchase. Registers the
// `window.RobloxItemPurchase` external (byte-parity with the legacy
// Roblox.Purchase.WebApp bundle) and bootstraps the price container. The
// assembled surface comes from @rbx/purchase-common so there is a single source
// of truth; on .NET the package's legacy bare imports resolve to window globals
// via rspack externals. The price-container mount uses core-scripts'
// renderWithErrorBoundary (the workspace-standard replacement for react-dom
// `render`) — same (element, container) signature, plus a defensive boundary.

const purchaseButtonId = "display-price-container";

window.RobloxItemPurchase = RobloxItemPurchase;

ready(() => {
  const buyButtonContainerElement = document.getElementById(purchaseButtonId);
  if (buyButtonContainerElement) {
    renderWithErrorBoundary(<PriceContainer />, buyButtonContainerElement);
  }
});
