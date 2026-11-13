import "./src/main.css";
import "./src/favorites-button.scss";
// ObsErrorBoundary (not renderWithErrorBoundary) handles crashes, so render directly.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render } from "react-dom";
import ready from "@rbx/core-scripts/util/ready";
import App from "./src/App";
import { reportPageLoad, reportPageView, ObsErrorBoundary } from "./src/observability";

const getAssetId = (container: HTMLElement) => container.getAttribute("data-asset-id")!;

const getAssetType = (containerElement: HTMLElement) => {
  // Convert 'Asset' to 'assets', 'Bundle' to 'bundles' for endpoint handling
  let itemType = containerElement.getAttribute("data-item-type")!;
  itemType += "s";
  return itemType.toLocaleLowerCase();
};

const mountReactApp = (containerElement: HTMLElement) => {
  reportPageView();
  render(
    <ObsErrorBoundary>
      <App assetId={getAssetId(containerElement)} itemType={getAssetType(containerElement)} />
    </ObsErrorBoundary>,
    containerElement,
  );
};

ready(() => {
  reportPageLoad();

  const containerElement = document.getElementById("favorites-button");

  if (containerElement) {
    // If the element is already in the DOM, mount the React app
    mountReactApp(containerElement);
  } else {
    // If the element is added dynamically, use MutationObserver
    const observer = new MutationObserver(() => {
      const dynamicContainer = document.getElementById("favorites-button");
      if (dynamicContainer) {
        mountReactApp(dynamicContainer);
        observer.disconnect(); // Stop observing after the element is found
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
