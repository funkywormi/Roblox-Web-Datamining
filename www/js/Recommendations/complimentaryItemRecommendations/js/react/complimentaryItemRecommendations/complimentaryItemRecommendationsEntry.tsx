import React from 'react';
import { ready } from 'core-utilities';
import { render } from 'react-dom';
import ComplimentaryItemRecommendationsContainer from './containers/ComplimentaryItemRecommendationsContainer';
import '../../../css/complimentaryItemRecommendations/complimentaryItemRecommendations.scss';
import complimentaryItemRecommendationsConstants, {
  TComplimentaryItemsEventOptions
} from './constants/complimentaryItemRecommendationsConstants';

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

function renderApp() {
  const containerElement = document.getElementById(
    complimentaryItemRecommendationsConstants.complimentaryItemElementName
  );
  if (containerElement) {
    render(
      <ComplimentaryItemRecommendationsContainer
        itemId={getTargetId(containerElement)}
        isBundle={checkIfBundle(containerElement)}
        displayPurchaseButtonLeft
      />,
      containerElement
    );
  } else {
    window.requestAnimationFrame(renderApp);
  }
}

function renderComplimentaryItemsUsingOptions(options: TComplimentaryItemsEventOptions) {
  const entryElement = document.getElementById(
    complimentaryItemRecommendationsConstants.complimentaryItemElementName
  );
  render(
    <ComplimentaryItemRecommendationsContainer
      itemId={options.targetId}
      isBundle={options.isBundle}
      displayPurchaseButtonLeft={options.displayPurchaseButtonLeft}
    />,
    entryElement
  );
}

ready(() => {
  window.addEventListener(
    complimentaryItemRecommendationsConstants.complimentaryItemRecommendationsEventName,
    event => {
      const options = ((event as unknown) as Record<string, unknown>)
        .detail as TComplimentaryItemsEventOptions;
      renderComplimentaryItemsUsingOptions(options);
    }
  );
});
