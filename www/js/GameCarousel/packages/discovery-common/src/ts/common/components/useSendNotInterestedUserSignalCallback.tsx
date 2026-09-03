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
      window.EventTracker?.fireEvent(
        userSignal.ExplicitFeedbackSignalStateRevertFailedDueToMissingToggle,
      );
    }
    systemFeedbackService.warning(translate(FeaturePlacesList.NetworkError));
  }, [toggleIsHidden, systemFeedbackService, translate]);

  return useCallback(
    (isNotInterested: boolean) => {
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
          { boolValue: isNotInterested },
          TUserSignalValueType.Bool,
          signalEntity,
          TUserSignalType.NotInterested,
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

export default useSendNotInterestedUserSignalCallback;
