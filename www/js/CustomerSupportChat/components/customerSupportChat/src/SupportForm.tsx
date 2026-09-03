import React, { useContext, useMemo } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";

import AgeGate from "./components/AgeGate";
import { SupportContext } from "./providers/SupportContextProvider";
import { SupportContextKey } from "./core/types/common";
import SupportFormComponent from "./components/SupportFormComponent";
import SupportPageContainer from "./components/common/support-page-container/SupportPageContainer";

const SupportForm: React.FC<WithTranslationsProps> = () => {
  const { ageGate, supportForm, chatbot, ageGateTag } = useContext(SupportContext);

  const currentStepFromContextProgress = useMemo(() => {
    const isAgeKnown = ageGate || ageGateTag;
    if (!isAgeKnown) return SupportContextKey.AgeGate;
    if (isAgeKnown && !supportForm) return SupportContextKey.SupportForm;
    if (isAgeKnown && supportForm && !chatbot) return SupportContextKey.Chatbot;
    return SupportContextKey.Invalid;
  }, [ageGate, ageGateTag, supportForm, chatbot]);

  return (
    <SupportPageContainer>
      {/* Age Gate: Only render if we do not have the user's date of birth stored in the context store */}
      {currentStepFromContextProgress === SupportContextKey.AgeGate && <AgeGate />}

      {/* Support Form: Only render if we already have the user's date of birth stored in the context store */}
      {currentStepFromContextProgress === SupportContextKey.SupportForm && <SupportFormComponent />}
    </SupportPageContainer>
  );
};

export default SupportForm;
