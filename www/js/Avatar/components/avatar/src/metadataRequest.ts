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
  // When enabled, the consolidated `PATCH /v4/avatar` (UpdateAvatar) endpoint replaces the
  // legacy equip endpoints (set-body-colors, set-scales, set-player-avatar-type,
  // set-wearing-assets).
  isUpdateAvatarV4Enabled: boolean;
  // When enabled, the avatar read path uses `GET /v4/avatar` instead of `/v2/avatar/avatar`.
  // Tracked as a separate flag from the write path so reads/writes can roll out independently.
  isGetAvatarV4Enabled: boolean;
  // When enabled, outfit create/update/details route through the `/v4/outfits/*` endpoints.
  // These carry the outfit definition ({ outfitModel, outfitConfigurations }) and are the only
  // outfit endpoints that persist the profile background (the V3 controller drops it).
  isOutfitApiV4Enabled: boolean;
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
  isUpdateAvatarV4Enabled: true,
  isGetAvatarV4Enabled: true,
  isOutfitApiV4Enabled: true,
  scaleBodyTypeIncrement: 0.05,
  scaleHeadIncrement: 0.05,
  scaleHeightIncrement: 0.05,
  scaleProportionIncrement: 0.05,
  scaleWidthIncrement: 0.05,
  showDefaultClothingMessageOnPageLoad: true,
  supportProportionAndBodyType: true,
};
