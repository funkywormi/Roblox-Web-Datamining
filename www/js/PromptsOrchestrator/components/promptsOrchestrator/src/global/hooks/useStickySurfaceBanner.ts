import { useLayoutEffect } from "react";
import { PROMPTS_ORCHESTRATOR_ID } from "../../common/constants/websiteConstants";

const ACTIVE_CLASS = "prompts-orchestrator-surface-banner-active";

export const useStickySurfaceBanner = () => {
  useLayoutEffect(() => {
    const promptsOrchestratorElement = document.getElementById(PROMPTS_ORCHESTRATOR_ID);

    if (!promptsOrchestratorElement) {
      return undefined;
    }

    promptsOrchestratorElement.classList.add(ACTIVE_CLASS);

    return () => {
      promptsOrchestratorElement.classList.remove(ACTIVE_CLASS);
    };
  }, []);
};
