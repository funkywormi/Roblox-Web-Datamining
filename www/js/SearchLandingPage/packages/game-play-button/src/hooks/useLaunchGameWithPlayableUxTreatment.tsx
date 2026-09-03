import { useState, useCallback, useMemo } from "react";
import {
  PlayableUxTreatmentEnum,
  TPlayableUxTreatmentData,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";
import { sendUnlockPlayIntentEvent } from "../utils/playButtonUtils";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import { usePlayabilityStatus } from "./usePlayabilityStatus";
import PlayableUxTreatmentModal from "../components/PlayableUxTreatmentModal";

const { counterEvents, unlockPlayIntentConstants } = playButtonConstants;

const isValidPlayableUxTreatmentData = (
  data?: Record<string, string>,
): data is TPlayableUxTreatmentData => {
  if (!data) {
    return false;
  }

  return (
    typeof data.titleText === "string" &&
    data.titleText.length > 0 &&
    typeof data.bodyText === "string" &&
    data.bodyText.length > 0 &&
    typeof data.primaryActionText === "string" &&
    data.primaryActionText.length > 0 &&
    typeof data.secondaryActionText === "string" &&
    data.secondaryActionText.length > 0
  );
};

type TLaunchGameWithPlayableUxTreatment = {
  doGameLaunchWithPlayableUxTreatment: () => void;
  playableUxTreatmentModal: React.ReactNode;
};

const useLaunchGameWithPlayableUxTreatment = (
  universeId: string,
  doGameLaunch: () => void,
  pageContext: TPlayButtonPageContext,
): TLaunchGameWithPlayableUxTreatment => {
  const [isReconfirmModalOpen, setIsReconfirmModalOpen] = useState<boolean>(false);

  const { playabilityStatus, playableUxTreatment, isFetchingPlayability } =
    usePlayabilityStatus(universeId);

  const sendUnlockPlayIntent = useCallback(
    (upsellName: string) => {
      sendUnlockPlayIntentEvent(universeId, upsellName, PlayabilityStatus.Playable, pageContext);
    },
    [universeId, pageContext],
  );

  const doGameLaunchWithPlayableUxTreatment = useCallback(() => {
    if (isFetchingPlayability) {
      // When we render play buttons with disableLoadingState, we intentionally want to support
      // game launch even when playability status fails or has not resolved to unblock play.
      // Launch game, and log a counter to understand how prevalant this case is.
      doGameLaunch();

      window.EventTracker?.fireEvent(
        counterEvents.PlayableUxTreatmentPlayabilityStatusStillLoading,
      );
      sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
      return;
    }

    if (playabilityStatus !== PlayabilityStatus.Playable || !playableUxTreatment?.treatment) {
      // Typical case: no playable UX treatment defined, proceed with game launch
      doGameLaunch();
      return;
    }

    if (playableUxTreatment.treatment !== PlayableUxTreatmentEnum.ReconfirmLaunchModal) {
      // Unsupported playableUxTreatment: log counter and proceed with game launch
      doGameLaunch();

      window.EventTracker?.fireEvent(counterEvents.PlayableUxTreatmentUnknownTreatment);
      sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
      return;
    }

    if (!isValidPlayableUxTreatmentData(playableUxTreatment.data)) {
      // Malformed treatment data: log counter and proceed with game launch
      doGameLaunch();

      window.EventTracker?.fireEvent(counterEvents.PlayableUxTreatmentMalformedData);
      sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
      return;
    }

    setIsReconfirmModalOpen(true);

    sendUnlockPlayIntent(unlockPlayIntentConstants.reconfirmLaunchModalUpsellName);
  }, [
    isFetchingPlayability,
    playabilityStatus,
    playableUxTreatment,
    doGameLaunch,
    sendUnlockPlayIntent,
  ]);

  const playableUxTreatmentModal = useMemo(() => {
    if (!isReconfirmModalOpen) {
      return null;
    }

    if (!playableUxTreatment || !isValidPlayableUxTreatmentData(playableUxTreatment.data)) {
      return null;
    }

    return (
      <PlayableUxTreatmentModal
        treatmentData={playableUxTreatment.data}
        isModalOpen={isReconfirmModalOpen}
        onConfirm={() => {
          setIsReconfirmModalOpen(false);
          doGameLaunch();
        }}
        onDismiss={() => {
          setIsReconfirmModalOpen(false);
        }}
      />
    );
  }, [playableUxTreatment, isReconfirmModalOpen, doGameLaunch]);

  return { doGameLaunchWithPlayableUxTreatment, playableUxTreatmentModal };
};

export default useLaunchGameWithPlayableUxTreatment;
