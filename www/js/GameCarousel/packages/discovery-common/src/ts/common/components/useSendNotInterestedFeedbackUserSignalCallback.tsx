import { useCallback } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { useSystemFeedback } from "@rbx/core-ui";
import bedev2Services from "../services/bedev2Services";
import { usePageSession } from "../utils/PageSessionContext";
import {
  TUserSignalEntity,
  TUserSignalAssetType,
  TUserSignalValueType,
  TUserSignalType,
} from "../types/userSignalTypes";
import { PageContext } from "../types/pageContext";
import { userSignal } from "../constants/configConstants";
import { FeaturePlacesList } from "../constants/translationConstants";
import { getProductSurface } from "./userSignalUtils";

const NotInterestedFeedbackFormId = {
  NotInterestedFeedback1: "NotInterestedFeedback1",
};

const NotInterestedFeedbackFormTitleId = {
  WhyHideExperience: "WhyHideExperience",
};

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
      const productSurface = getProductSurface(page);
      if (!productSurface) {
        onSignalFailure();
        return;
      }

      if (!topicId) {
        onSignalFailure();
        window.EventTracker?.fireEvent(userSignal.ExplicitFeedbackMissingTopicIdCounterEvent);
        return;
      }

      const feedbackItems = [];
      for (const value of Object.keys(selectedValues)) {
        feedbackItems.push({
          id: value,
          selected: selectedValues[value] || false,
        });
      }
      const feedbackResponse = {
        formId: NotInterestedFeedbackFormId.NotInterestedFeedback1,
        titleId: NotInterestedFeedbackFormTitleId.WhyHideExperience,
        textResponse: text,
        items: feedbackItems,
      };

      const assetType = isSponsored
        ? TUserSignalAssetType.SponsoredGame
        : TUserSignalAssetType.Game;

      const signalEntity: TUserSignalEntity = {
        id: universeId.toString(),
        assetType,
        signalOrigin: {
          productSurface,
          topicId,
          subIds: [topicId],
        },
      };

      bedev2Services
        .postUserSignal(
          { stringValue: JSON.stringify(feedbackResponse) },
          TUserSignalValueType.String,
          signalEntity,
          TUserSignalType.NotInterestedFeedback,
          pageSession,
        )
        .catch(() => {
          onSignalFailure();
          window.EventTracker?.fireEvent(userSignal.ExplicitFeedbackUserSignalFailedCounterEvent);
        });
    },
    [universeId, page, topicId, isSponsored, pageSession, onSignalFailure],
  );
};

export default useSendNotInterestedFeedbackUserSignalCallback;
