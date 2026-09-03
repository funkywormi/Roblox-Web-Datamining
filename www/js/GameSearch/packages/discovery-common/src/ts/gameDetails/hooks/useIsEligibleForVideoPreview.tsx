import { useMemo } from "react";
import { isVideoPlayerSupportedByBrowser } from "@rbx/video-player";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  usePlayabilityStatus,
  PlayabilityStatus,
  useAgeRecommendationDataForUniverseId,
} from "@rbx/game-play-button";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

const { layerNames, defaultValues } = experimentConstants;

/**
 * Determines whether an experience is eligible to show a game preview video.
 *
 * Authenticated users must:
 * - be in a browser that supports the video player
 * - be enrolled in the IXP experiment (or bypassed)
 * - have a playability response that is eligible for video
 *
 * Unauthenticated users must:
 * - be in a browser that supports the video player
 * - be on an experience with a content maturity rating of "minimal"
 *
 * @param universeId - The universe ID of the experience
 * @param shouldBypassIxpCheck - If true, skip the IXP experiment check (used for tile video
 *   previews, where the backend gates the feature through sending wideVideoAssetId to enrolled users)
 */
const useIsEligibleForVideoPreview = (
  universeId: string,
  shouldBypassIxpCheck = false,
): {
  isEligibleForVideoPreview: boolean;
  isLoadingEligibility: boolean;
} => {
  const browserCompatibilityResult = useMemo(() => {
    return isVideoPlayerSupportedByBrowser();
  }, []);

  const ineligibleVideoPlayabilityStatuses: Set<string> = useMemo(() => {
    return new Set([
      PlayabilityStatus.UnderReview,
      PlayabilityStatus.UniverseRootPlaceIsPrivate,
      PlayabilityStatus.InsufficientPermissionFriendsOnly,
      PlayabilityStatus.InsufficientPermissionGroupOnly,
      PlayabilityStatus.GameUnapproved,
      PlayabilityStatus.AccountRestricted,
      PlayabilityStatus.ComplianceBlocked,
      PlayabilityStatus.ContextualPlayabilityRegionalCompliance,
      PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls,
      PlayabilityStatus.ContextualPlayabilityAgeGated,
      PlayabilityStatus.ContextualPlayabilityUnrated,
      PlayabilityStatus.ContextualPlayabilityAgeGatedByDescriptor,
      PlayabilityStatus.ContextualPlayabilityExperienceBlockedParentalControls,
      PlayabilityStatus.ContextualPlayabilityRequireParentApproval,
      PlayabilityStatus.ContextualPlayabilityAgeCheckRequired,
      PlayabilityStatus.ContextualPlayabilityCoreGated,
      PlayabilityStatus.ContextualPlayabilityUnverifiedSeventeenPlusUser,
    ]);
  }, []);

  const { playabilityStatus, isPlayable, isFetchingPlayability } = usePlayabilityStatus(universeId);

  const isAuthenticated = Boolean(authenticatedUser()?.isAuthenticated);

  const { ageRecommendationData, isLoading: isLoadingAgeRecommendationData } =
    useAgeRecommendationDataForUniverseId(
      universeId,
      // Disable fetch for authenticated users and for unsupported browsers (maturity rating is not used)
      isAuthenticated || !browserCompatibilityResult.isSupported,
    );

  const { ixpData, isLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const isLoadingIxp = shouldBypassIxpCheck ? false : isLoading;
  const isGamePreviewVideoEnabledIxp = shouldBypassIxpCheck || ixpData.IsGamePreviewVideoEnabled;

  return useMemo(() => {
    if (!browserCompatibilityResult.isSupported) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: false,
      };
    }

    if (!isAuthenticated) {
      // Unauthenticated users are eligible for video if the experience maturity rating is minimal (ignore IXP and playability)
      if (isLoadingAgeRecommendationData) {
        return {
          isEligibleForVideoPreview: false,
          isLoadingEligibility: true,
        };
      }

      const contentMaturityRating =
        ageRecommendationData?.ageRecommendationDetails?.summary.ageRecommendation?.contentMaturity;

      if (contentMaturityRating === "minimal") {
        return {
          isEligibleForVideoPreview: true,
          isLoadingEligibility: false,
        };
      }

      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: false,
      };
    }

    // Authenticated users are eligible for video if IXP is enabled (or bypassed) and playability is valid
    if (isLoadingIxp || isFetchingPlayability) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: true,
      };
    }

    // Experience is eligible if playable, or if not playable but the reason is not in the ineligible list
    const isEligibleFromPlayabilityStatus =
      isPlayable === true ||
      (playabilityStatus !== undefined &&
        !ineligibleVideoPlayabilityStatuses.has(playabilityStatus));

    const isEligible = isGamePreviewVideoEnabledIxp && isEligibleFromPlayabilityStatus;

    return {
      isEligibleForVideoPreview: isEligible,
      isLoadingEligibility: false,
    };
  }, [
    isGamePreviewVideoEnabledIxp,
    isLoadingIxp,
    isAuthenticated,
    playabilityStatus,
    isPlayable,
    isFetchingPlayability,
    ageRecommendationData,
    isLoadingAgeRecommendationData,
    ineligibleVideoPlayabilityStatuses,
    browserCompatibilityResult.isSupported,
  ]);
};

export default useIsEligibleForVideoPreview;
