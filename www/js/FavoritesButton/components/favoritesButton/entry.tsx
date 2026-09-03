import './src/main.css';
import './src/favorites-button.scss';
import ready from '@rbx/core-scripts/util/ready';
import { renderWithErrorBoundary } from '@rbx/core-scripts/react';
import App from './src/App';

const getAssetId = (container: HTMLElement) => container.getAttribute('data-asset-id')!;

const getAssetType = (containerElement: HTMLElement) => {
  // Convert 'Asset' to 'assets', 'Bundle' to 'bundles' for endpoint handling
  let itemType = containerElement.getAttribute('data-item-type')!;
  itemType += 's';
  return itemType.toLocaleLowerCase();
};

const mountReactApp = (containerElement: HTMLElement) => {
  renderWithErrorBoundary(
    <App assetId={getAssetId(containerElement)} itemType={getAssetType(containerElement)} />,
    containerElement
  );
};

ready(() => {
  const containerElement = document.getElementById('favorites-button');

  if (containerElement) {
    // If the element is already in the DOM, mount the React app
    mountReactApp(containerElement);
  } else {
    // If the element is added dynamically, use MutationObserver
    const observer = new MutationObserver(() => {
      const dynamicContainer = document.getElementById('favorites-button');
      if (dynamicContainer) {
        mountReactApp(dynamicContainer);
        observer.disconnect(); // Stop observing after the element is found
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
