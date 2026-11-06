import React from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import AgeEstimationPromptContainer from "./ageEstimationPromptModal/containers/AgeEstimationPromptContainer";
import { AgeEstimationPromptModalStateProvider } from "./ageEstimationPromptModal/stores/AgeEstimationPromptModalStoreContext";

function AgeEstimationPromptApp() {
  const { translate } = useTranslation();
  return (
    <AgeEstimationPromptModalStateProvider>
      <AgeEstimationPromptContainer translate={translate} />
    </AgeEstimationPromptModalStateProvider>
  );
}

export default AgeEstimationPromptApp;
