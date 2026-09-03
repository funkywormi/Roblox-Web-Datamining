import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import SponsoredCatalogItemsRow from './containers/SponsoredCatalogItemsRow';
import '../../../css/sponsoredCatalogItems/sponsoredCatalogItems.scss';

const getPlacementLocation = (containerElement: HTMLElement) => {
  const placementLocation = containerElement.getAttribute('data-placement-location');
  if (placementLocation) {
    return placementLocation.toString();
  }
  return '';
};

function renderApp() {
  const containerElement = document.getElementById('sponsored-catalog-items');
  if (containerElement) {
    render(
      <SponsoredCatalogItemsRow placementLocation={getPlacementLocation(containerElement)} />,
      containerElement
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});

window.Roblox.SponsoredCatalogItems = SponsoredCatalogItemsRow;
