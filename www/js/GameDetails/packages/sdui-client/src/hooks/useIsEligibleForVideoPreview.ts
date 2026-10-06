import { useMemo } from "react";
import { isVideoPlayerSupportedByBrowser } from "@rbx/video-player";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  usePlayabilityStatus,
  PlayabilityStatus,
  useAgeRecommendationDataForUniverseId,
} from "@rbx/game-play-button";

/**
 * Determines whether an experience is eligible to show a game preview video.
 *
 * Authenticated users must:
 * - be in a browser that supports the video player
 * - have a playability response that is eligible for video
 *
 * Unauthenticated users must:
 * - be in a browser that supports the video player
 * - be on an experience with a content maturity rating of "minimal"
 *
 * @param universeId - The universe ID of the experience
 * @param enabled - When false, skip the check and report not eligible. Defaults to true.
 */
export const useIsEligibleForVideoPreview = (
  universeId: string,
  enabled = true,
): {
  isEligibleForVideoPreview: boolean;
  isLoadingEligibility: boolean;
  isBrowserSupported: boolean;
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

  const { playabilityStatus, isPlayable, isFetchingPlayability } = usePlayabilityStatus(
    universeId,
    enabled,
  );

  const isAuthenticated = Boolean(authenticatedUser()?.isAuthenticated);

  const { ageRecommendationData, isLoading: isLoadingAgeRecommendationData } =
    useAgeRecommendationDataForUniverseId(
      universeId,
      // Disable fetch for authenticated users, unsupported browsers, and callers that have not
      // asked for a check yet (maturity rating is not used in those cases)
      !enabled || isAuthenticated || !browserCompatibilityResult.isSupported,
    );

  const eligibility = useMemo(() => {
    if (!enabled) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: false,
      };
    }

    if (!browserCompatibilityResult.isSupported) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: false,
      };
    }

    if (!isAuthenticated) {
      // Unauthenticated users are eligible for video if the experience maturity rating is minimal (ignore playability)
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

    if (isFetchingPlayability) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: true,
      };
    }

    // Experience is eligible if playable, or if not playable but the reason is not in the ineligible list
    const isEligible =
      isPlayable === true ||
      (playabilityStatus !== undefined &&
        !ineligibleVideoPlayabilityStatuses.has(playabilityStatus));

    return {
      isEligibleForVideoPreview: isEligible,
      isLoadingEligibility: false,
    };
  }, [
    isAuthenticated,
    playabilityStatus,
    isPlayable,
    isFetchingPlayability,
    ageRecommendationData,
    isLoadingAgeRecommendationData,
    ineligibleVideoPlayabilityStatuses,
    browserCompatibilityResult.isSupported,
    enabled,
  ]);

  return {
    ...eligibility,
    isBrowserSupported: browserCompatibilityResult.isSupported,
  };
};
