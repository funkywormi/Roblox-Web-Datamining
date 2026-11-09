import React, { useCallback } from "react";
import playButtonConstants from "../constants/playButtonConstants";
import { usePlaytestUpsellFlow } from "../hooks/usePlaytestUpsellFlow";
import { usePlayButtonTranslate } from "../hooks/usePlayButtonTranslate";
import type {
  TAppsFlyerReferralProperties,
  TPlayButtonPageContext,
  TPrivatePlaytestInfo,
} from "../types/playButtonTypes";
import {
  getJoindata,
  getPlaytestUnlockUpsellType,
  launchGame,
  PlaytestUnlockUpsellType,
  sendUnlockPlayIntentEvent,
  startAgeCheckAccessManagementUpsellFlow,
} from "../utils/playButtonUtils";

const { playButtonTextTranslationMap, playButtonUpsellContexts, unlockPlayIntentConstants } =
  playButtonConstants;

const EMPTY_OBJECT = {} as const;

export type TPlaytestButtonProps = {
  universeId: string;
  placeId: string;
  rootPlaceId?: string;
  creatorId?: number;
  privatePlaytestInfo: TPrivatePlaytestInfo;
  refetchPlayabilityStatus: () => void;
  pageContext: TPlayButtonPageContext;
  eventProperties?: Record<string, string | number | undefined>;
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties;
};

/**
 * Secondary Playtest CTA. Launches the private playtest when it is playable; otherwise opens
 * the upsell that unlocks it (age check, playtest settings, or trusted friend).
 */
export const PlaytestButton = ({
  universeId,
  placeId,
  rootPlaceId,
  creatorId,
  privatePlaytestInfo,
  refetchPlayabilityStatus,
  pageContext,
  eventProperties = EMPTY_OBJECT,
  appsFlyerReferralProperties = EMPTY_OBJECT,
}: TPlaytestButtonProps): React.JSX.Element => {
  const translate = usePlayButtonTranslate();
  const {
    openUpdatePlaytestSettingsUpsell,
    openTrustedFriendsPlaytestUpsell,
    playtestUpsellModals,
  } = usePlaytestUpsellFlow({ creatorId });

  const launchPlaytest = useCallback((): void => {
    const joinData = getJoindata(
      eventProperties.launchData != null ? String(eventProperties.launchData) : undefined,
    );

    launchGame(
      placeId,
      rootPlaceId,
      undefined,
      undefined,
      eventProperties,
      joinData,
      appsFlyerReferralProperties,
      "PlaytestPlayButtonClick",
      true,
    );
  }, [appsFlyerReferralProperties, eventProperties, placeId, rootPlaceId]);

  const handlePlaytestClick = useCallback(
    (event: React.MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();

      if (privatePlaytestInfo.isPlayable) {
        launchPlaytest();
        return;
      }

      const status = privatePlaytestInfo.playabilityStatus;
      const playtestUnlockUpsellType = getPlaytestUnlockUpsellType(status);
      if (status === undefined || playtestUnlockUpsellType === undefined) {
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
      launchPlaytest,
      openTrustedFriendsPlaytestUpsell,
      openUpdatePlaytestSettingsUpsell,
      pageContext,
      privatePlaytestInfo,
      refetchPlayabilityStatus,
      universeId,
    ],
  );

  const playtestButtonText = translate(playButtonTextTranslationMap.Playtest) || "Preview";

  return (
    <React.Fragment>
      <button
        type="button"
        data-testid="playtest-play-button"
        className="btn-control-lg btn-full-width playtest-play-button"
        onClick={handlePlaytestClick}
      >
        {playtestButtonText}
      </button>
      {playtestUpsellModals}
    </React.Fragment>
  );
};

export default PlaytestButton;
