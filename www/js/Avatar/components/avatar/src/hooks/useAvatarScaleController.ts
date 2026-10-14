import { useState, useCallback, useEffect } from "react";
import { reportAXError } from "../utils/axAnalyticsService";
import { trackEditAttempted, trackEditFailed, trackEditSucceeded } from "../observability";
import DEFAULT_AVATAR_SCALES from "../utils/avatarScale.constants";
import AvatarScaleUtils from "../utils/avatarScale.utils";
import { AvatarConfig, AvatarConfigV2 } from "../avatarRequest";
import { PlayerAvatarConfig } from "../avatarRules";
import avatarConstants from "../constants/avatarConstants";
import { Scales, ScalesKeys, isScalesWithBodyTypeAndProportion } from "../constants/types";
import { AvatarSettings } from "../metadataRequest";
import AvatarAPIService from "../services/avatarAPIService";
import parseError from "../utils/parseErrorUtil";
import { isAvatarEditingDisabledError } from "../utils/avatarEditingError.utils";
import { useSystemFeedback } from "../contexts/SystemFeedbackContext";
import { trackAvatarEdit, AvatarEditorTrackingEvents } from "../utils/axTracking";

const useAvatarScaleController = (
  avatarRules: PlayerAvatarConfig | undefined,
  avatarSettings: AvatarSettings | undefined,
  avatarDetails: AvatarConfig | AvatarConfigV2 | undefined,
) => {
  const [scales, setScales] = useState<Scales>(DEFAULT_AVATAR_SCALES);
  const systemFeedback = useSystemFeedback();

  const scaleProportionAndBodyTypeEnabled = !!(
    avatarSettings?.supportProportionAndBodyType &&
    avatarRules?.proportionsAndBodyTypeEnabledForUser
  );

  const updateScale = useCallback(
    (newValue: number, scaleKey: ScalesKeys) => {
      const updatedScales = AvatarScaleUtils.updateScales(newValue, scaleKey, scales);
      setScales(updatedScales);
      trackAvatarEdit(AvatarEditorTrackingEvents.ScaleChange, { scaleKey, value: newValue });
      const updatedScaleValues = {
        height: updatedScales.height.value / 100,
        width: updatedScales.width.value / 100,
        head: updatedScales.head.value / 100,
        ...(scaleProportionAndBodyTypeEnabled &&
          isScalesWithBodyTypeAndProportion(updatedScales) && {
            proportion: updatedScales.proportion.value / 100,
            bodyType: updatedScales.bodyType.value / 100,
          }),
      };
      trackEditAttempted("scale");
      AvatarAPIService.setScales(updatedScaleValues).then(
        () => {
          trackEditSucceeded("scale");
        },
        e => {
          reportAXError({
            itemName: "UpdateScalesError",
            counterName: "AvatarEditorError",
            log: parseError(e),
          });

          if (isAvatarEditingDisabledError(e)) {
            systemFeedback.info(avatarConstants.page.avatarEditingDisabled);
          } else {
            trackEditFailed("scale", e);
            systemFeedback.error(avatarConstants.scales.failedToUpdate);
          }
        },
      );
    },
    [scales, scaleProportionAndBodyTypeEnabled, systemFeedback],
  );

  useEffect(() => {
    if (!avatarRules || !avatarSettings || !avatarDetails) {
      return;
    }

    setScales(prevScales => {
      let updatedScales = AvatarScaleUtils.initializeScaleMetrics(
        prevScales,
        avatarRules,
        avatarSettings,
        scaleProportionAndBodyTypeEnabled,
      );
      updatedScales = AvatarScaleUtils.applyCurrentScale(
        updatedScales,
        avatarDetails,
        scaleProportionAndBodyTypeEnabled,
      );
      return updatedScales;
    });
  }, [scaleProportionAndBodyTypeEnabled, avatarRules, avatarSettings, avatarDetails]);

  return {
    scales,
    updateScale,
  };
};

export default useAvatarScaleController;
