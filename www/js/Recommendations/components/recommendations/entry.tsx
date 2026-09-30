import "./src/main.css";
import React, { useEffect, useState } from "react";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import Recommendations from "@rbx/catalog/recommendations/Recommendations";
import { translations } from "./component.json";
import ComplimentaryItemRecommendationsContainer from "@rbx/catalog/complimentaryItemRecommendations/containers/ComplimentaryItemRecommendationsContainer";
import complimentaryItemRecommendationsConstants, {
  TComplimentaryItemsEventOptions,
} from "@rbx/catalog/complimentaryItemRecommendations/constants/complimentaryItemRecommendationsConstants";
import "@rbx/catalog/css/recommendations/recommendations.scss";
import "@rbx/catalog/css/complimentaryItemRecommendations/complimentaryItemRecommendations.scss";

const CONTAINER_ID = "item-recommendations-container";

type MountState = {
  recommendationType: number;
  recommendationSubtype: number;
  pageName: string;
  available: boolean;
};

const readBool = (element: HTMLElement, attribute: string) =>
  element.getAttribute(attribute)?.toString().toLowerCase() === "true";

const readNumber = (element: HTMLElement, attribute: string) => {
  const parsed = Number(element.getAttribute(attribute));
  return Number.isFinite(parsed) ? parsed : 0;
};

const readState = (element: HTMLElement): MountState => ({
  recommendationType: readNumber(element, "data-recommendation-type"),
  recommendationSubtype: readNumber(element, "data-recommendation-subtype"),
  pageName: element.getAttribute("data-page-name") ?? "",
  available: readBool(element, "data-recommendation-available"),
});

// The host is Angular and owns the category route, so the subtype changes without this root
// remounting. The attributes give the first value and `recommendations:render` gives every one after,
// which is why the container is NOT inside the host's ng-if: an ng-if would destroy this root on every
// category change.
const RecommendationsIsland = ({ element }: { element: HTMLElement }): JSX.Element | null => {
  const [state, setState] = useState<MountState>(() => readState(element));

  useEffect(() => {
    const onRender = (event: Event) => {
      const detail = (event as CustomEvent<Partial<MountState>>).detail ?? {};
      setState(previous => ({ ...previous, ...detail }));
    };
    window.addEventListener("recommendations:render", onRender);
    return () => window.removeEventListener("recommendations:render", onRender);
  }, []);

  if (!state.available) {
    return null;
  }

  return (
    <Recommendations
      recommendationType={state.recommendationType}
      recommendationSubtype={state.recommendationSubtype}
      pageName={state.pageName}
      // Never passed by the Angular host, so the See All affordance stays off exactly as it is today.
      showSeeAllButton={false}
    />
  );
};

// The host renders its template after this bundle loads, so the container can be absent on the first
// tick. Same requestAnimationFrame retry the other catalog entries use.
function renderRecommendations() {
  const containerElement = document.getElementById(CONTAINER_ID);
  if (!containerElement) {
    window.requestAnimationFrame(renderRecommendations);
    return;
  }

  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <RecommendationsIsland element={containerElement} />
    </TranslationProvider>,
    containerElement,
  );
}

// The Recommendations SCC shipped complimentaryItemRecommendations as a SECOND bundle, and a workspace
// component supports one entry, so the two are merged. Both bundles were always deployed together by
// this same SCC, so page-level behaviour is unchanged.
//
// Only the event path is carried over, deliberately. The original entry also defined a renderApp() that
// mounted straight from the container's data attributes, but its ready() block registered the listener
// and NEVER called renderApp, so the initial mount has only ever happened via the event. Calling it here
// would switch on a mount production has never performed.
function renderComplimentaryItems(options: TComplimentaryItemsEventOptions) {
  const containerElement = document.getElementById(
    complimentaryItemRecommendationsConstants.complimentaryItemElementName,
  );
  if (!containerElement) {
    return;
  }
  renderWithErrorBoundary(
    <TranslationProvider config={translations}>
      <ComplimentaryItemRecommendationsContainer
        itemId={options.targetId}
        isBundle={options.isBundle}
        displayPurchaseButtonLeft={options.displayPurchaseButtonLeft}
      />
    </TranslationProvider>,
    containerElement,
  );
}

ready(() => {
  renderRecommendations();
  window.addEventListener(
    complimentaryItemRecommendationsConstants.complimentaryItemRecommendationsEventName,
    event => {
      const options = (event as CustomEvent<TComplimentaryItemsEventOptions>).detail;
      if (options) {
        renderComplimentaryItems(options);
      }
    },
  );
});
