import { useState, useCallback } from "react";
import { Endpoints } from "@rbx/core-scripts/legacy/Roblox";
import {
  TSettingResponse,
  TAppsFlyerReferralProperties,
  TContentMaturityRating,
  TAgeRestrictionSettingOptionValue,
  type TPlayButtonPageContext,
} from "../types/playButtonTypes";
import {
  launchGame,
  startAgeCheckAccessManagementUpsellFlow,
  sendUnlockPlayIntentEvent,
} from "../utils/playButtonUtils";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import useGuacPlayButtonUI from "./useGuacPlayButtonUI";

const { counterEvents, unlockPlayIntentConstants, playButtonUpsellContexts, ampNamespaces } =
  playButtonConstants;

type TContextualParentalControlUpsell = {
  launchPlayButtonUpsell: (
    contentAgeRestriction: TSettingResponse | undefined,
    contentMaturityRating: TContentMaturityRating | undefined,
    hasError: boolean,
  ) => void;
  isSelfUpdateSettingModalOpen: boolean;
  navigateToAccountSettings: () => void;
  closeSelfUpdateSettingModal: () => void;
  isRestrictedUnplayableModalOpen: boolean;
  closeRestrictedUnplayableModal: () => void;
};

/**
 * Returns a callback that should be called when the user clicks the play button.
 * The callback uses the experience's contentMaturityRating and the user's contentAgeRestriction setting
 * to determine which upsell modal to display, and then displays it to the user.
 */
const useContextualParentalControlsUpsell = (
  placeId: string,
  universeId: string,
  pageContext: TPlayButtonPageContext,
  rootPlaceId?: string,
  privateServerLinkCode?: string,
  gameInstanceId?: string,
  eventProperties?: Record<string, string | number | undefined>,
  appsFlyerReferralProperties?: TAppsFlyerReferralProperties,
): TContextualParentalControlUpsell => {
  const { data: guacData } = useGuacPlayButtonUI();

  const [isSelfUpdateSettingModalOpen, setIsSelfUpdateSettingModalOpen] = useState<boolean>(false);

  const [isRestrictedUnplayableModalOpen, setIsRestrictedUnplayableModalOpen] =
    useState<boolean>(false);

  const launchGameFallback = useCallback(() => {
    launchGame(
      placeId,
      rootPlaceId,
      privateServerLinkCode,
      gameInstanceId,
      eventProperties,
      undefined,
      appsFlyerReferralProperties,
    );
  }, [
    eventProperties,
    gameInstanceId,
    placeId,
    privateServerLinkCode,
    rootPlaceId,
    appsFlyerReferralProperties,
  ]);

  const launchPlayButtonUpsell = useCallback(
    async (
      contentAgeRestriction: TSettingResponse | undefined,
      contentMaturityRating: TContentMaturityRating | undefined,
      hasError: boolean,
    ) => {
      const sendUnlockPlayIntent = (upsellName: string) => {
        sendUnlockPlayIntentEvent(
          universeId,
          upsellName,
          PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls,
          pageContext,
        );
      };

      const { fireEvent } = window.EventTracker ?? {};
      if (hasError || contentAgeRestriction === undefined || contentMaturityRating === undefined) {
        launchGameFallback();

        fireEvent?.(counterEvents.PlayButtonUpsellUnknownSettingOrAge);

        sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
        return;
      }

      if (contentMaturityRating === "minimal") {
        // if the maturity rating is minimal, we shouldn't have entered this flow because
        // the game should be playable. show an error counter and fallback to game launch
        launchGameFallback();

        fireEvent?.(counterEvents.PlayButtonUpsellMinimalMaturityRating);

        sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
        return;
      }

      const maturityRatingToAgeRestrictionSetting: Record<
        Exclude<TContentMaturityRating, "minimal">,
        TAgeRestrictionSettingOptionValue
      > = {
        mild: "NinePlus",
        moderate: "ThirteenPlus",
        restricted: "SeventeenPlus",
        unrated: "ThirteenPlus",
      };

      const requestedSettingValue = maturityRatingToAgeRestrictionSetting[contentMaturityRating];

      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!requestedSettingValue) {
        launchGameFallback();

        fireEvent?.(counterEvents.PlayButtonUpsellAgeNotInMapping);

        sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
        return;
      }

      const requestedOption = contentAgeRestriction.options.find(
        option => option.option.optionValue === requestedSettingValue,
      );

      if (requestedOption) {
        const { requirement } = requestedOption;

        switch (requirement) {
          case "SelfUpdateSetting": {
            setIsSelfUpdateSettingModalOpen(true);

            fireEvent?.(counterEvents.PlayButtonUpsellSelfUpdateSettingTriggered);

            sendUnlockPlayIntent(requirement);
            break;
          }
          case "ParentalConsent": {
            fireEvent?.(counterEvents.PlayButtonUpsellAskYourParentTriggered);

            sendUnlockPlayIntent(requirement);

            if (!window.Roblox.AccessManagementUpsellV2Service) {
              fireEvent?.(counterEvents.PlayButtonUpsellParentalConsentError);
              break;
            }

            try {
              const upsellParams = guacData?.useExperienceApprovalForParentalConsent
                ? {
                    featureName: "CanApproveExperience",
                    namespace: ampNamespaces.accountManagement,
                    isAsyncCall: false,
                    usePrologue: true,
                    ampRecourseData: {
                      universeId,
                      experienceManagementAction: "Approve",
                    },
                  }
                : {
                    featureName: "CanChangeSetting",
                    namespace: ampNamespaces.settingChange,
                    isAsyncCall: false,
                    usePrologue: true,
                    ampRecourseData: {
                      contentAgeRestriction: requestedOption.option.optionValue,
                    },
                  };

              await window.Roblox.AccessManagementUpsellV2Service.startAccessManagementUpsell(
                upsellParams,
              );
            } catch {
              launchGameFallback();

              fireEvent?.(counterEvents.PlayButtonUpsellParentalConsentError);

              sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
            }

            break;
          }
          case "ContentAgeRestrictionVerification": {
            try {
              fireEvent?.(counterEvents.PlayButtonUpsellAgeRestrictionVerificationTriggered);

              sendUnlockPlayIntent(requirement);

              const success = await startAgeCheckAccessManagementUpsellFlow({
                context: playButtonUpsellContexts.gameJoinContentMaturityLock,
                pageContext,
              });

              if (success) {
                window.location.reload();
              }
            } catch {
              launchGameFallback();

              sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
            }

            break;
          }
          default: {
            launchGameFallback();

            fireEvent?.(counterEvents.PlayButtonUpsellUnknownRequirement);

            sendUnlockPlayIntent(unlockPlayIntentConstants.gameLaunchFallbackUpsellName);
          }
        }
      } else {
        setIsRestrictedUnplayableModalOpen(true);

        fireEvent?.(counterEvents.PlayButtonUpsellRestrictedUnplayableTriggered);

        sendUnlockPlayIntent(unlockPlayIntentConstants.restrictedUnplayableUpsellName);
      }
    },
    [guacData, launchGameFallback, universeId, pageContext],
  );

  const closeSelfUpdateSettingModal = useCallback(() => {
    setIsSelfUpdateSettingModalOpen(false);
  }, []);

  const closeRestrictedUnplayableModal = useCallback(() => {
    setIsRestrictedUnplayableModalOpen(false);
  }, []);

  const navigateToAccountSettings = useCallback(() => {
    const url = Endpoints.getAbsoluteUrl("/my/account#!/privacy");
    if (typeof window !== "undefined") {
      window.location.href = url;
      setIsSelfUpdateSettingModalOpen(false);
    }
  }, []);

  return {
    // TODO: old, migrated code
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    launchPlayButtonUpsell,
    isSelfUpdateSettingModalOpen,
    navigateToAccountSettings,
    closeSelfUpdateSettingModal,
    isRestrictedUnplayableModalOpen,
    closeRestrictedUnplayableModal,
  };
};

export default useContextualParentalControlsUpsell;
