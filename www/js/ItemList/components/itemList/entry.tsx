import "./src/main.css";
import React from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import ItemListContainer from "@rbx/catalog/itemList/containers/ItemListContainer";
import itemListConstants, {
  TItemListEventOptions,
} from "@rbx/catalog/itemList/constants/itemListConstants";
import { TItemCardSource } from "@rbx/catalog/analytics/axTrackingEvents";
import "@rbx/catalog/css/itemList/itemList.scss";

const getEventIdentifier = (containerElement: HTMLElement) => {
  const eventIdentifier = containerElement.getAttribute("data-event-identifier");
  return eventIdentifier;
};

// Maps the item-list mount point identifier to the analytics source used for
// ItemCardClick tracking.
const getItemCardSource = (eventIdentifier: string): TItemCardSource => {
  switch (eventIdentifier) {
    case "included-items":
      return TItemCardSource.ItemDetailsBundleContents;
    case "recommendations":
    default:
      return TItemCardSource.ItemDetailsRecommendations;
  }
};

function renderItemListUsingOptions(options: TItemListEventOptions) {
  const entryElement = document.getElementById(
    `${itemListConstants.itemListElementName}-${options.eventIdentifier}`,
  );
  if (entryElement !== null && getEventIdentifier(entryElement) === options.eventIdentifier) {
    renderWithErrorBoundary(
      <ItemListContainer
        items={options.items}
        purchasable={options.purchasable}
        selectable={options.selectable}
        backgroundVisualContainer={options.backgroundVisualContainer}
        titleText={options.titleText}
        wrapItems={options.wrapItems}
        showCreatorName={options.showCreatorName}
        showPrice={options.showPrice}
        showItemType={options.showItemType}
        checkOwnership={options.checkOwnership}
        defaultPermanentTimedOption={options.defaultPermanentTimedOption}
        source={getItemCardSource(options.eventIdentifier)}
      />,
      entryElement,
    );
  }
}

// The item-list:render CustomEvent is dispatched from js/angular/itemDetails/controllers/
// itemDetailsController.js, which has not migrated, so the event name and the
// `${itemListElementName}-${eventIdentifier}` id are both runtime contracts.
ready(() => {
  window.addEventListener(itemListConstants.itemListEventName, event => {
    const options = (event as unknown as Record<string, unknown>).detail as TItemListEventOptions;
    renderItemListUsingOptions(options);
  });
});

// Carried over from itemListContainerEntry.ts, which the ItemList SCC shipped as a second bundle.
// A workspace component supports only one entry, so the two are merged; both bundles were always
// deployed together by this same SCC.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).Roblox.ItemList = ItemListContainer;
