import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import AssetResalePaneContainer from "@rbx/catalog/resellers/containers/AssetResalePaneContainer";
import AngularToReactPurchaseHandoffContainer from "@rbx/catalog/angularToReactPurchaseHandoff/containers/AngularToReactPurchaseHandoffContainer";
import "@rbx/catalog/css/resellers/resellers.css";

// Carried over from angularToReactPurchaseHandoffEntry.tsx, which the ItemResale SCC shipped as a
// second bundle. A workspace component supports only one entry, so the two are merged; both bundles
// were always deployed together by this same SCC.

const RESALE_PANE_ID = "asset-resale-data-container";
const PURCHASE_HANDOFF_ID = "angular-react-purchase-handoff";

const readBool = (element: HTMLElement, attribute: string) =>
  element.getAttribute(attribute)?.toString().toLowerCase() === "true";

// assetResalePaneController read these off its own host element rather than from bindings, preferring
// #asset-resale-data-container over #item-container. That fallback is unreachable now that the same id
// is also the mount point, so it is not carried over.
function renderResalePane() {
  const containerElement = document.getElementById(RESALE_PANE_ID);
  if (!containerElement) {
    window.requestAnimationFrame(renderResalePane);
    return;
  }

  const targetId = containerElement.getAttribute("data-target-id") ?? "";

  renderWithErrorBoundary(
    <AssetResalePaneContainer
      assetId={targetId}
      isBundle={readBool(containerElement, "data-is-bundle")}
      assetData={{
        id: targetId,
        name: containerElement.getAttribute("data-item-name") ?? undefined,
        type: containerElement.getAttribute("data-asset-type") ?? undefined,
        productId: containerElement.getAttribute("data-product-id") ?? undefined,
        membershipRequirement: containerElement.getAttribute("data-bc-requirement") ?? undefined,
      }}
      economyMetadata={{
        purchasingEnabled: readBool(containerElement, "data-is-purchase-enabled"),
      }}
    />,
    containerElement,
  );
}

// #angular-react-purchase-handoff is published by the resellers pane, so this root now nests inside
// the pane's rather than inside Angular's. The id stays a DOM contract either way.
function renderPurchaseHandoff() {
  const containerElement = document.getElementById(PURCHASE_HANDOFF_ID);
  if (containerElement) {
    renderWithErrorBoundary(
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
  renderResalePane();
  renderPurchaseHandoff();
});
