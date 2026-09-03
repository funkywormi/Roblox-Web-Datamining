import { AvatarConfig, AvatarConfigV2 } from "../avatarRequest";
import { PlayerAvatarConfig } from "../avatarRules";
import avatarConstants from "../constants/avatarConstants";
import { Scale, Scales, isScalesWithBodyTypeAndProportion, ScalesKeys } from "../constants/types";
import { AvatarSettings } from "../metadataRequest";

// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class AvatarScaleUtils {
  static applyScaleConstraints(scaleRule: { min: number; max: number }, scale: Scale): Scale {
    const updatedScale: Scale = {
      ...scale,
      min: scaleRule.min * 100,
      max: scaleRule.max * 100,
    };
    return updatedScale;
  }

  static applyCurrentScale(
    scales: Scales,
    avatarDetails: AvatarConfig | AvatarConfigV2,
    scaleProportionAndBodyTypeEnabled: boolean,
  ): Scales {
    const updatedScales = {
      ...scales,
      height: { ...scales.height, value: avatarDetails.scales.height * 100 },
      width: { ...scales.width, value: avatarDetails.scales.width * 100 },
      head: { ...scales.head, value: avatarDetails.scales.head * 100 },
    };

    if (scaleProportionAndBodyTypeEnabled && isScalesWithBodyTypeAndProportion(scales)) {
      updatedScales.proportion = {
        ...scales.proportion,
        value: avatarDetails.scales.proportion * 100,
      };
      updatedScales.bodyType = {
        ...scales.bodyType,
        value: avatarDetails.scales.bodyType * 100,
      };
    }

    return updatedScales;
  }

  static updateScales(newValue: number, scaleKey: ScalesKeys, scales: Scales): Scales {
    const updatedScales = {
      ...scales,
      [scaleKey]: { ...scales[scaleKey], value: newValue },
    };
    return updatedScales;
  }

  static initializeScaleMetrics(
    scales: Scales,
    avatarRules: PlayerAvatarConfig,
    metaData: AvatarSettings,
    scaleProportionAndBodyTypeEnabled: boolean,
  ): Scales {
    const updatedScales: Scales = {
      ...scales,
      height: { ...scales.height, increment: metaData.scaleHeightIncrement * 100 },
      width: { ...scales.width, increment: metaData.scaleWidthIncrement * 100 },
      head: { ...scales.head, increment: metaData.scaleHeadIncrement * 100 },
    };

    updatedScales.height = AvatarScaleUtils.applyScaleConstraints(
      avatarRules.scales.height,
      updatedScales.height,
    );
    updatedScales.width = AvatarScaleUtils.applyScaleConstraints(
      avatarRules.scales.width,
      updatedScales.width,
    );
    updatedScales.head = AvatarScaleUtils.applyScaleConstraints(
      avatarRules.scales.head,
      updatedScales.head,
    );

    if (scaleProportionAndBodyTypeEnabled) {
      updatedScales.bodyType = {
        label: avatarConstants.bodyScaling.bodyType,
        min: 0,
        max: 100,
        value: 0,
        increment: 5,
        type: avatarConstants.bodyScalingType.bodyType,
      };
      updatedScales.proportion = {
        label: avatarConstants.bodyScaling.proportions,
        min: 0,
        max: 100,
        value: 0,
        increment: 5,
        type: avatarConstants.bodyScalingType.proportions,
      };
      updatedScales.proportion = AvatarScaleUtils.applyScaleConstraints(
        avatarRules.scales.proportion,
        updatedScales.proportion,
      );
      updatedScales.bodyType = AvatarScaleUtils.applyScaleConstraints(
        avatarRules.scales.bodyType,
        updatedScales.bodyType,
      );
    }
    return updatedScales;
  }
}

export default AvatarScaleUtils;
