import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { render } from "react-dom";
import { BrowserRouter } from "react-router-dom";
import CatalogPageContainer from "@rbx/catalog/catalog/containers/CatalogPageContainer";
import AngularToReactPurchaseHandoffContainer from "@rbx/catalog/angularToReactPurchaseHandoff/containers/AngularToReactPurchaseHandoffContainer";
import "@rbx/catalog/css/catalog/catalog.scss";

// Carried over from shoppingCartEntry.tsx and AngularToReactPurchaseHandoffEntry.tsx, which the
// Catalog SCC shipped as second and third bundles. A workspace component supports only one entry,
// so the three are merged; all three bundles were always deployed together by this same SCC.
import "@rbx/catalog/shoppingCart/utils/cartBtnMounter";
import "@rbx/catalog/shoppingCart/components/AddToCartButton";
import "@rbx/catalog/shoppingCart/components/ShoppingCartModal";
import "@rbx/catalog/shoppingCart/services/cartService";
import "@rbx/catalog/shoppingCart/constants/urlConfigs";
import "@rbx/catalog/shoppingCart/constants/types";
import "@rbx/catalog/css/shoppingCart/shoppingCart.scss";
import "@rbx/catalog/css/shoppingCart/shoppingCartButton.scss";
import "@rbx/catalog/css/itemDetailsThumbnail/itemDetailsThumbnail.scss";
import "@rbx/catalog/css/itemDetailsThumbnail/iconAnimations.scss";

const ENTRY_ID = "catalog-react-container";
const PURCHASE_HANDOFF_ID = "angular-react-purchase-handoff";

function renderCatalogContainer(): void {
  const containerElement = document.getElementById(ENTRY_ID);
  if (containerElement) {
    render(
      <BrowserRouter>
        <CatalogPageContainer />
      </BrowserRouter>,
      containerElement,
    );
  }
}

function renderPurchaseHandoff() {
  const containerElement = document.getElementById(PURCHASE_HANDOFF_ID);
  if (containerElement) {
    render(
      <AngularToReactPurchaseHandoffContainer
        identifier={containerElement.getAttribute("data-identifier")}
      />,
      containerElement,
    );
  } else {
    window.requestAnimationFrame(renderPurchaseHandoff);
  }
}

ready(() => {
  renderCatalogContainer();
  renderPurchaseHandoff();
});
