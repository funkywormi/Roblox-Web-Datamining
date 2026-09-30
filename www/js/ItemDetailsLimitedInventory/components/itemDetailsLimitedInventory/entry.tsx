import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import ItemDetailsLimitedInventoryContainer from "@rbx/catalog/itemDetailsLimitedInventory/containers/ItemDetailsLimitedInventoryContainer";
import itemDetailsLimitedInventoryConstants from "@rbx/catalog/itemDetailsLimitedInventory/constants/itemDetailsLimitedInventoryConstants";
import "@rbx/catalog/css/itemDetailsLimitedInventory/itemDetailsLimitedInventory.scss";

const getTargetId = (containerElement: HTMLElement) => {
  const targetId = containerElement.getAttribute("data-target-id");
  if (targetId) {
    return parseInt(targetId, 10);
  }
  return 0;
};

const checkIfBundle = (containerElement: HTMLElement) => {
  return containerElement.getAttribute("data-is-bundle")?.toString().toLowerCase() === "true";
};

// In case we move to hydrating the component before load in the future
const getItemName = (containerElement: HTMLElement) => {
  return containerElement.getAttribute("data-item-name")?.toString();
};

const checkIfCollectible = (containerElement: HTMLElement) => {
  return containerElement.getAttribute("data-is-collectible")?.toString().toLowerCase() === "true";
};

const getCollectibleItemId = (containerElement: HTMLElement) => {
  return containerElement.getAttribute("data-collectible-item-id")?.toString().toLowerCase();
};

const getResaleRestriction = (containerElement: HTMLElement) => {
  return containerElement.getAttribute("resale-restriction")?.toString().toLowerCase();
};

// The container id is a DOM contract with js/angular/resellers/.../assetResalePane.html, which has
// not migrated.
function renderApp() {
  const containerElement = document.getElementById(
    itemDetailsLimitedInventoryConstants.itemDetailsLimitedInventoryElementName,
  );
  if (containerElement) {
    renderWithErrorBoundary(
      <ItemDetailsLimitedInventoryContainer
        itemId={getTargetId(containerElement)}
        isBundle={checkIfBundle(containerElement)}
      />,
      containerElement,
    );
  } else {
    // The Angular host may not have created the container yet.
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});
