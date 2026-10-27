import { useLayoutEffect } from "react";
import { PROMPTS_ORCHESTRATOR_ID, SITE_HEADER_ID } from "../../common/constants/websiteConstants";
import type { AppPage } from "../../common/constants/pageConstants";
import { PromptErrorName } from "../../common/telemetry/constants";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";

const TOP_PROPERTY = "--prompts-orchestrator-surface-banner-top";
/**
 * TODO: When a surface onboarded with prompts needs sticky functionality:
 * 1. Uncomment CONSUMER_STICKY_TOP_PROPERTY
 * 2. Uncomment the setProperty logic
 * 3. Move the useGlobalPromptsLayoutUpdater hook in SurfaceBanner to GlobalPrompts
 */
// Exposed CSS custom property for consumers to configure their sticky top
// position. The value is the sum of the site header's bottom value and the prompts orchestrator height
// const CONSUMER_STICKY_TOP_PROPERTY = "--prompts-orchestrator-consumer-sticky-top";

export const useGlobalPromptsLayoutUpdater = (appPage: AppPage) => {
  useLayoutEffect(() => {
    const promptsOrchestratorElement = document.getElementById(PROMPTS_ORCHESTRATOR_ID);

    if (!promptsOrchestratorElement) {
      // This is a defensive check for type safety/linting. This should not be possible
      // because if it didn't exist, the prompts orchestrator would not be rendered
      return undefined;
    }

    const siteHeader = document.getElementById(SITE_HEADER_ID);
    if (!siteHeader) {
      // This technically should not be possible because the site header is provided in the initial html markup.
      // Adding an error emit in case the ID changes without notice.
      getPromptsErrorReporter().reportPromptError({
        errorName: PromptErrorName.SiteHeaderDoesNotExist,
        errorMessage: `Could not update global prompts layout because #${SITE_HEADER_ID} does not exist`,
        appPage,
      });
      return undefined;
    }

    const updateLayout = () => {
      const { bottom: siteHeaderBottom } = siteHeader.getBoundingClientRect();
      promptsOrchestratorElement.style.setProperty(TOP_PROPERTY, `${siteHeaderBottom}px`);

      // const { height: promptsOrchestratorHeight } =
      //   promptsOrchestratorElement.getBoundingClientRect();
      // const consumerStickyTop = siteHeaderBottom + promptsOrchestratorHeight;
      // promptsOrchestratorElement.parentElement?.style.setProperty(
      //   CONSUMER_STICKY_TOP_PROPERTY,
      //   `${consumerStickyTop}px`,
      // );
    };

    updateLayout();

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateLayout);
    resizeObserver?.observe(siteHeader);
    resizeObserver?.observe(promptsOrchestratorElement);

    return () => {
      resizeObserver?.disconnect();
      promptsOrchestratorElement.style.removeProperty(TOP_PROPERTY);
      // promptsOrchestratorElement.parentElement?.style.removeProperty(CONSUMER_STICKY_TOP_PROPERTY);
    };
  }, [appPage]);
};
