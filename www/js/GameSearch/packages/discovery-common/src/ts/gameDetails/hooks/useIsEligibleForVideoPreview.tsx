import { useMemo } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useIsEligibleForVideoPreview as useIsEligibleForVideoPreviewHook } from "@rbx/sdui-client/hooks/useIsEligibleForVideoPreview";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import experimentConstants from "../../common/constants/experimentConstants";

const { layerNames, defaultValues } = experimentConstants;

/**
 * Determines whether an experience is eligible to show a game preview video.
 *
 * Calls the base eligibility check from `@rbx/sdui-client`, then adds a game-details IXP check:
 * - Unsupported browsers and signed-out users ignore IXP.
 * - Authenticated users are eligible only if the base result is eligible
 *    and they are enrolled in the IXP experiment.
 * - With `shouldBypassIxpCheck`, authenticated users get the base result unchanged too.
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
  const { isEligibleForVideoPreview, isLoadingEligibility, isBrowserSupported } =
    useIsEligibleForVideoPreviewHook(universeId);
  const isAuthenticated = Boolean(authenticatedUser()?.isAuthenticated);

  const { ixpData, isLoading } = useExperimentValues(
    layerNames.gameDetails,
    defaultValues.gameDetails,
  );
  const isLoadingIxp = shouldBypassIxpCheck ? false : isLoading;
  const isGamePreviewVideoEnabledIxp = shouldBypassIxpCheck || ixpData.IsGamePreviewVideoEnabled;

  return useMemo(() => {
    // Unsupported browsers and signed-out users ignore IXP.
    if (!isBrowserSupported || !isAuthenticated) {
      return { isEligibleForVideoPreview, isLoadingEligibility };
    }

    if (isLoadingIxp) {
      return {
        isEligibleForVideoPreview: false,
        isLoadingEligibility: true,
      };
    }

    return {
      isEligibleForVideoPreview: isGamePreviewVideoEnabledIxp && isEligibleForVideoPreview,
      isLoadingEligibility,
    };
  }, [
    isBrowserSupported,
    isEligibleForVideoPreview,
    isLoadingEligibility,
    isAuthenticated,
    isGamePreviewVideoEnabledIxp,
    isLoadingIxp,
  ]);
};

export default useIsEligibleForVideoPreview;
