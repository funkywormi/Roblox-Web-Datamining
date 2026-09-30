import "./src/main.css";
import React from "react";
import { render } from "react-dom";
import { TUserItemPermissions } from "@rbx/catalog/itemDetailsInfo/constants/types";
import ItemDetailsInfoContainer from "@rbx/catalog/itemDetailsInfo/containers/ItemDetailsInfoContainer";
import { reloadTranslations } from "@rbx/catalog/itemDetailsInfo/services/translationService";
import ErrorBoundary from "@rbx/catalog/catalog/containers/ErrorBoundry";
import "@rbx/catalog/css/itemDetailsInfo/itemDetailsInfo.scss";

// Carried over from shoppingCartEntry.tsx, which the ItemDetailsInfo SCC shipped as a second
// bundle. A workspace component supports only one entry, so the two are merged; both bundles were
// always deployed together by this same SCC.
import "@rbx/catalog/shoppingCart/utils/cartBtnMounter";
import "@rbx/catalog/shoppingCart/components/AddToCartButton";
import "@rbx/catalog/shoppingCart/components/ShoppingCartModal";
import "@rbx/catalog/shoppingCart/services/cartService";
import "@rbx/catalog/shoppingCart/constants/urlConfigs";
import "@rbx/catalog/shoppingCart/constants/types";
import "@rbx/catalog/css/shoppingCart/shoppingCart.scss";
import "@rbx/catalog/css/shoppingCart/shoppingCartButton.scss";

const ENTRY_ID = "item-info-container-frontend";

function getBoolDataAttribute(element: HTMLElement, dataAttribute: string) {
  const elm =
    dataAttribute === "isPurchaseEnabled" ? document.getElementById("item-container") : element;
  const value = elm?.dataset?.[dataAttribute];
  if (typeof value === "undefined") return null;
  return (value || "").toLowerCase() === "true";
}
function getNumberDataAttribute(element: HTMLElement, dataAttribute: string) {
  const value = element?.dataset?.[dataAttribute];
  if (typeof value === "undefined" || !value?.length) return null;
  return parseInt(value, 10) || 0;
}

function extractPermissionAttributes(container: HTMLElement): TUserItemPermissions {
  const missingKeys: string[] = [];
  const result: TUserItemPermissions = {
    canConfigureItem: false,
    canReportItem: true,
    canManageItem: false,
    canSponsorItem: false,
    canViewConfigurePage: false,
    canViewDevelopPage: false, // unused
    isAllowedInShowcase: false,
    isModerated: false,
    isDeletableType: true,
    isInShowcase: false,
    isNotCurrentlyForSale: false, // unused
    isPurchaseEnabled: true,
  };
  const keys = Object.keys(result);
  keys.forEach(k => {
    const value = getBoolDataAttribute(container, k);
    if (value === null) {
      missingKeys.push(k);
    } else {
      (result as Record<string, boolean>)[k] = !!value;
    }
  });
  if (missingKeys.length) {
    // eslint-disable-next-line no-console
    // console.warn(`#${ENTRY_ID} entry missing following permission keys`, missingKeys);
  }
  return result;
}

function renderItemDetailsContainer(): void {
  reloadTranslations();
  const containerElement = document.getElementById(ENTRY_ID);
  if (containerElement) {
    const permissionAttributes = extractPermissionAttributes(containerElement);
    render(
      <ErrorBoundary containerName="ItemDetailsInfoEntry">
        <ItemDetailsInfoContainer
          isBundle={getBoolDataAttribute(containerElement, "isBundle") || false}
          targetId={getNumberDataAttribute(containerElement, "targetId") || 0}
          permissions={permissionAttributes}
        />
      </ErrorBoundary>,
      containerElement,
    );
  } else {
    window.requestAnimationFrame(renderItemDetailsContainer);
  }
}

if (document.readyState === "complete") {
  renderItemDetailsContainer(); // Document has already loaded, call the function directly
} else {
  window.addEventListener("load", renderItemDetailsContainer); // Attach listener if load event hasn't fired yet
}
