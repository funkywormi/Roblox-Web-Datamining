import { useCallback } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import { usePageSession } from "../utils/PageSessionContext";
import { PageContext } from "../types/pageContext";
import { FeaturePlacesList } from "../constants/translationConstants";
import { sendNotInterestedFeedbackUserSignal } from "./userSignalUtils";

// send a NotInterestedFeedback user signal that contains the answers from the not interested feedback form
const useSendNotInterestedFeedbackUserSignalCallback = (
  universeId: number,
  translate: TranslateFunction,
  toggleShowGiveFeedbackButton: () => void,
  page?: PageContext,
  topicId?: string,
  isSponsored?: boolean,
): ((selectedValues: { [key: string]: boolean }, text: string) => void) => {
  const { systemFeedbackService } = useSystemFeedback();
  const pageSession = usePageSession();

  const onSignalFailure = useCallback(() => {
    // revert the hidden state if signal fails
    toggleShowGiveFeedbackButton();
    systemFeedbackService.warning(translate(FeaturePlacesList.NetworkError));
  }, [toggleShowGiveFeedbackButton, systemFeedbackService, translate]);

  return useCallback(
    (selectedValues: { [key: string]: boolean }, text: string) => {
      sendNotInterestedFeedbackUserSignal({
        universeId: universeId.toString(),
        topicId,
        isSponsored,
        page,
        pageSession,
        selectedValues,
        text,
        onFailure: onSignalFailure,
      });
    },
    [universeId, page, topicId, isSponsored, pageSession, onSignalFailure],
  );
};

export default useSendNotInterestedFeedbackUserSignalCallback;
