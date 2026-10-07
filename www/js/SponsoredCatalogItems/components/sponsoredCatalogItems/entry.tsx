import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import SponsoredCatalogItemsRow from "@rbx/catalog/sponsoredCatalogItems/containers/SponsoredCatalogItemsRow";
import "@rbx/catalog/css/sponsoredCatalogItems/sponsoredCatalogItems.scss";

const getPlacementLocation = (containerElement: HTMLElement) => {
  const placementLocation = containerElement.getAttribute("data-placement-location");
  if (placementLocation) {
    return placementLocation.toString();
  }
  return "";
};

function renderApp() {
  const containerElement = document.getElementById("sponsored-catalog-items");
  if (containerElement) {
    renderWithErrorBoundary(
      <SponsoredCatalogItemsRow placementLocation={getPlacementLocation(containerElement)} />,
      containerElement,
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Roblox.SponsoredCatalogItems = SponsoredCatalogItemsRow;
