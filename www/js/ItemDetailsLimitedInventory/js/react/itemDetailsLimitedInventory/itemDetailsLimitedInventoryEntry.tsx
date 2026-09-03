import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import ItemDetailsLimitedInventoryContainer from './containers/ItemDetailsLimitedInventoryContainer';
import '../../../css/itemDetailsLimitedInventory/itemDetailsLimitedInventory.scss';
import complimentaryItemRecommendationsConstants from './constants/itemDetailsLimitedInventoryConstants';

const getTargetId = (containerElement: HTMLElement) => {
  const targetId = containerElement.getAttribute('data-target-id');
  if (targetId) {
    return parseInt(targetId, 10);
  }
  return 0;
};

const checkIfBundle = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('data-is-bundle')?.toString().toLowerCase() === 'true';
};

// In case we move to hydrating the component before load in the future
const getItemName = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('data-item-name')?.toString();
};

const checkIfCollectible = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('data-is-collectible')?.toString().toLowerCase() === 'true';
};

const getCollectibleItemId = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('data-collectible-item-id')?.toString().toLowerCase();
};

const getResaleRestriction = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('resale-restriction')?.toString().toLowerCase();
};

function renderApp() {
  const containerElement = document.getElementById(
    complimentaryItemRecommendationsConstants.itemDetailsLimitedInventoryElementName
  );
  if (containerElement) {
    render(
      <ItemDetailsLimitedInventoryContainer
        itemId={getTargetId(containerElement)}
        isBundle={checkIfBundle(containerElement)}
      />,
      containerElement
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});
