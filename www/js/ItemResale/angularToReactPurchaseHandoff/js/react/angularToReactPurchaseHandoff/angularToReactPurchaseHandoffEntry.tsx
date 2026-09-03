import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import AngularToReactPurchaseHandoffContainer from './containers/AngularToReactPurchaseHandoffContainer';
import '../../../css/itemDetailsThumbnail/itemDetailsThumbnail.scss';
import '../../../css/itemDetailsThumbnail/iconAnimations.scss';

const getIdentifier = (containerElement: HTMLElement) => {
  return containerElement.getAttribute('data-identifier');
};

function renderApp() {
  const containerElement = document.getElementById('angular-react-purchase-handoff');
  if (containerElement) {
    render(
      <AngularToReactPurchaseHandoffContainer identifier={getIdentifier(containerElement)} />,
      containerElement
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

ready(() => {
  renderApp();
});
