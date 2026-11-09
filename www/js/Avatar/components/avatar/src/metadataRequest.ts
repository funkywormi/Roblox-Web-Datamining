export type AvatarSettings = {
  enableDefaultClothingMessage: boolean;
  isAvatarScaleEmbeddedInTab: boolean;
  isBodyTypeScaleOutOfTab: boolean;
  scaleHeightIncrement: number;
  scaleWidthIncrement: number;
  scaleHeadIncrement: number;
  scaleProportionIncrement: number;
  scaleBodyTypeIncrement: number;
  supportProportionAndBodyType: boolean;
  showDefaultClothingMessageOnPageLoad: boolean;
  areThreeDeeThumbsEnabled: boolean;
  isAvatarWearingApiCallsLockingOnFrontendEnabled: boolean;
  isOutfitHandlingOnFrontendEnabled: boolean;
  isJustinUiChangesEnabled: boolean;
  isCategoryReorgEnabled: boolean;
  LCEnabledInEditorAndCatalog: boolean;
  isLCCompletelyEnabled: boolean;
};

export const defaultSettings: AvatarSettings = {
  LCEnabledInEditorAndCatalog: true,
  areThreeDeeThumbsEnabled: true,
  enableDefaultClothingMessage: true,
  isAvatarScaleEmbeddedInTab: true,
  isAvatarWearingApiCallsLockingOnFrontendEnabled: true,
  isBodyTypeScaleOutOfTab: true,
  isCategoryReorgEnabled: true,
  isJustinUiChangesEnabled: true,
  isLCCompletelyEnabled: true,
  isOutfitHandlingOnFrontendEnabled: true,
  scaleBodyTypeIncrement: 0.05,
  scaleHeadIncrement: 0.05,
  scaleHeightIncrement: 0.05,
  scaleProportionIncrement: 0.05,
  scaleWidthIncrement: 0.05,
  showDefaultClothingMessageOnPageLoad: true,
  supportProportionAndBodyType: true,
};
