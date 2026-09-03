import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import ItemDetailsThumbnailContainer from './containers/ItemDetailsThumbnailContainer';
import '../../../css/itemDetailsThumbnail/itemDetailsThumbnail.scss';
import '../../../css/itemDetailsThumbnail/iconAnimations.scss';

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

const checkIfAnimationBundle = (containerElement: HTMLElement) => {
  return (
    containerElement.getAttribute('data-is-animation-bundle')?.toString().toLowerCase() === 'true'
  );
};

const checkifShowMode3D = (containerElement: HTMLElement) => {
  return (
    containerElement.getAttribute('data-show-3d-mode-button')?.toString().toLowerCase() === 'true'
  );
};

const checkIfShowTryOn = (containerElement: HTMLElement) => {
  return (
    containerElement.getAttribute('data-show-try-on-button')?.toString().toLowerCase() === 'true'
  );
};

function renderApp() {
  const containerElement = document.getElementById('item-thumbnail-container-frontend');

  if (containerElement) {
    render(
      <ItemDetailsThumbnailContainer
        targetId={getTargetId(containerElement)}
        isBundle={checkIfBundle(containerElement)}
        isAnimationBundle={checkIfAnimationBundle(containerElement)}
        showMode3D={checkifShowMode3D(containerElement)}
        showTryOn={checkIfShowTryOn(containerElement)}
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
