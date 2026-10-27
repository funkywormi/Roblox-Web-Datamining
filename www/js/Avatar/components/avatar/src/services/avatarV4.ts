/**
 * `GET /v4/avatar` query and response mapper, shared by the .NET and Next.js avatar services.
 */

import { AvatarConfigV2 } from "../avatarRequest";
import { GetAvatarResponseV4 } from "../types/updateAvatarV4.types";
import { mapPlayerAvatarType } from "./outfitV4";

// All `selectionTypes` accepted by `GET /v4/avatar` (integer values 0-5). Requesting every
// section returns the full avatar definition (model + configurations) for the editor.
// Serialized as repeated keys (`selectionTypes=0&selectionTypes=1&...`) for ASP.NET binding.
export const getAvatarV4SearchParams = (): string =>
  [0, 1, 2, 3, 4, 5].map(type => `selectionTypes=${type}`).join("&");

export const mapGetAvatarV4ToConfigV2 = (response: GetAvatarResponseV4): AvatarConfigV2 => {
  const { avatarModel, avatarConfigurations } = response;
  return {
    scales: avatarModel.scales,
    playerAvatarType: mapPlayerAvatarType(avatarModel.playerAvatarType),
    // V4 returns `bodyColors` with `*Color` field names (BodyColorsModelV4); map back to the
    // editor's internal `bodyColor3s`/`*Color3` shape consumed by the rest of the app.
    bodyColor3s: {
      headColor3: avatarModel.bodyColors.headColor,
      torsoColor3: avatarModel.bodyColors.torsoColor,
      rightArmColor3: avatarModel.bodyColors.rightArmColor,
      leftArmColor3: avatarModel.bodyColors.leftArmColor,
      rightLegColor3: avatarModel.bodyColors.rightLegColor,
      leftLegColor3: avatarModel.bodyColors.leftLegColor,
    },
    assets: avatarModel.assets,
    // Not returned by the V4 endpoint; these flags are unused in editor logic today.
    defaultShirtApplied: false,
    defaultPantsApplied: false,
    emotes: avatarConfigurations?.emotes ?? [],
    equippedBackgroundAssetId: avatarConfigurations?.background?.backgroundAsset?.id,
  };
};
