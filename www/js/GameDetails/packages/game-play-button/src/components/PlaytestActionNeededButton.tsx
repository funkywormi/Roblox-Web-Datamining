import React, { useCallback, useEffect } from "react";
import playButtonConstants from "../constants/playButtonConstants";
import { usePlaytestUpsellFlow } from "../hooks/usePlaytestUpsellFlow";
import type { TPlayButtonPageContext, TPrivatePlaytestInfo } from "../types/playButtonTypes";
import {
  getPlaytestUnlockUpsellType,
  PlaytestUnlockUpsellType,
  sendUnlockPlayIntentEvent,
  startAgeCheckAccessManagementUpsellFlow,
} from "../utils/playButtonUtils";
import ActionNeededButton from "./ActionNeededButton";

const { counterEvents, playButtonUpsellContexts, unlockPlayIntentConstants } = playButtonConstants;

export type TPlaytestActionNeededButtonProps = {
  universeId: string;
  creatorId?: number;
  privatePlaytestInfo: TPrivatePlaytestInfo;
  refetchPlayabilityStatus: () => void;
  pageContext: TPlayButtonPageContext;
  buttonClassName?: string;
};

export const PlaytestActionNeededButton = ({
  universeId,
  creatorId,
  privatePlaytestInfo,
  refetchPlayabilityStatus,
  pageContext,
  buttonClassName,
}: TPlaytestActionNeededButtonProps): React.JSX.Element => {
  useEffect(() => {
    window.EventTracker?.fireEvent(counterEvents.ActionNeeded);
  }, []);

  const {
    openUpdatePlaytestSettingsUpsell,
    openTrustedFriendsPlaytestUpsell,
    playtestUpsellModals,
  } = usePlaytestUpsellFlow({
    creatorId,
  });

  const handlePlaytestUnlockClick = useCallback(
    (event: React.MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      const status = privatePlaytestInfo.playabilityStatus;
      const playtestUnlockUpsellType = getPlaytestUnlockUpsellType(status);
      if (
        privatePlaytestInfo.isPlayable ||
        status === undefined ||
        playtestUnlockUpsellType === undefined
      ) {
        return;
      }

      if (playtestUnlockUpsellType === PlaytestUnlockUpsellType.AgeVerification) {
        sendUnlockPlayIntentEvent(
          universeId,
          unlockPlayIntentConstants.ageCheckUpsellName,
          status,
          pageContext,
        );

        // This click path owns its async side effects; React does not consume returned promises.
        // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation
        void (async () => {
          try {
            const success = await startAgeCheckAccessManagementUpsellFlow({
              context: playButtonUpsellContexts.gameJoinAgeCheckRequired,
              pageContext,
            });
            if (success) {
              refetchPlayabilityStatus();
            }
          } catch {
            // The AMP helper records its own failure metric.
          }
        })();
        return;
      }

      if (playtestUnlockUpsellType === PlaytestUnlockUpsellType.UpdatePlaytestSettings) {
        openUpdatePlaytestSettingsUpsell();
        sendUnlockPlayIntentEvent(
          universeId,
          unlockPlayIntentConstants.updatePlaytestSettingsUpsellName,
          status,
          pageContext,
        );
        return;
      }

      openTrustedFriendsPlaytestUpsell();
      sendUnlockPlayIntentEvent(
        universeId,
        unlockPlayIntentConstants.trustedFriendRequiredUpsellName,
        status,
        pageContext,
      );
    },
    [
      openTrustedFriendsPlaytestUpsell,
      openUpdatePlaytestSettingsUpsell,
      pageContext,
      privatePlaytestInfo,
      refetchPlayabilityStatus,
      universeId,
    ],
  );

  return (
    <React.Fragment>
      <ActionNeededButton
        onButtonClick={handlePlaytestUnlockClick}
        buttonClassName={buttonClassName}
      />
      {playtestUpsellModals}
    </React.Fragment>
  );
};

export default PlaytestActionNeededButton;
