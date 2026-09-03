import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import ItemListContainer from './containers/ItemListContainer';
import '../../../css/itemList/itemList.scss';
import itemListConstants, { TItemListEventOptions } from './constants/itemListConstants';
import { TItemCardSource } from '../analytics/axTrackingEvents';

const getEventIdentifier = (containerElement: HTMLElement) => {
  const eventIdentifier = containerElement.getAttribute('data-event-identifier');
  return eventIdentifier;
};

// Maps the item-list mount point identifier to the analytics source used for
// ItemCardClick tracking.
const getItemCardSource = (eventIdentifier: string): TItemCardSource => {
  switch (eventIdentifier) {
    case 'included-items':
      return TItemCardSource.ItemDetailsBundleContents;
    case 'recommendations':
    default:
      return TItemCardSource.ItemDetailsRecommendations;
  }
};

function renderItemListUsingOptions(options: TItemListEventOptions) {
  const entryElement = document.getElementById(
    `${itemListConstants.itemListElementName}-${options.eventIdentifier}`
  );
  if (entryElement !== null && getEventIdentifier(entryElement) === options.eventIdentifier) {
    render(
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
      entryElement
    );
  }
}

ready(() => {
  window.addEventListener(itemListConstants.itemListEventName, event => {
    const options = ((event as unknown) as Record<string, unknown>).detail as TItemListEventOptions;
    renderItemListUsingOptions(options);
  });
});
