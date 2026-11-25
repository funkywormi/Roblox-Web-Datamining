import { useCallback } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import { fireEvent } from "@rbx/www-common/event-tracker";
import { usePageSession } from "../utils/PageSessionContext";
import { PageContext } from "../types/pageContext";
import { userSignal } from "../constants/configConstants";
import { FeaturePlacesList } from "../constants/translationConstants";
import { sendNotInterestedUserSignal } from "./userSignalUtils";

// send a NotInterested user signal with true for not interested or false for undoing a not interested
const useSendNotInterestedUserSignalCallback = (
  universeId: number,
  translate: TranslateFunction,
  page?: PageContext,
  topicId?: string,
  isSponsored?: boolean,
  toggleIsHidden?: () => void,
): ((isNotInterested: boolean) => void) => {
  const { systemFeedbackService } = useSystemFeedback();
  const pageSession = usePageSession();

  const onSignalFailure = useCallback(() => {
    // revert the hidden state if signal fails
    if (toggleIsHidden) {
      toggleIsHidden();
    } else {
      fireEvent(userSignal.ExplicitFeedbackSignalStateRevertFailedDueToMissingToggle);
    }
    systemFeedbackService.warning(translate(FeaturePlacesList.NetworkError));
  }, [toggleIsHidden, systemFeedbackService, translate]);

  return useCallback(
    (isNotInterested: boolean) => {
      sendNotInterestedUserSignal({
        universeId: universeId.toString(),
        topicId,
        isSponsored,
        page,
        pageSession,
        isNotInterested,
        onFailure: onSignalFailure,
      });
    },
    [universeId, page, topicId, isSponsored, pageSession, onSignalFailure],
  );
};

export default useSendNotInterestedUserSignalCallback;
