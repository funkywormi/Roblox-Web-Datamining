/**
 * `PATCH /v4/avatar` request builders, shared by the .NET and Next.js avatar services.
 */

import {
  AvatarUpdateType,
  AvatarDefinitionV4,
  UpdateAvatarModelV4,
  UpdateAvatarConfigV4,
  EmoteRequestModel,
  AvatarUpdateSections,
  UpdateAvatarRequestV4,
} from "../types/updateAvatarV4.types";

/**
 * Composes an `UpdateAvatarRequestV4` from the provided sections. Only sections that are
 * present are declared in `updateTypes` and serialized into the payload.
 */
export const buildAvatarUpdateRequest = (sections: AvatarUpdateSections): UpdateAvatarRequestV4 => {
  const updateTypes: AvatarUpdateType[] = [];
  const updateAvatarModel: UpdateAvatarModelV4 = {};
  const updateAvatarConfig: UpdateAvatarConfigV4 = {};

  if (sections.bodyColors) {
    updateTypes.push(AvatarUpdateType.UpdateBodyColors);
    updateAvatarModel.bodyColors = {
      headColor: sections.bodyColors.headColorId,
      torsoColor: sections.bodyColors.torsoColorId,
      rightArmColor: sections.bodyColors.rightArmColorId,
      leftArmColor: sections.bodyColors.leftArmColorId,
      rightLegColor: sections.bodyColors.rightLegColorId,
      leftLegColor: sections.bodyColors.leftLegColorId,
    };
  }

  if (sections.scales) {
    updateTypes.push(AvatarUpdateType.UpdateScales);
    updateAvatarModel.scales = sections.scales;
  }

  if (sections.avatarType) {
    updateTypes.push(AvatarUpdateType.UpdateAvatarType);
    updateAvatarModel.playerAvatarType = sections.avatarType;
  }

  if (sections.assets) {
    updateTypes.push(AvatarUpdateType.UpdateAssets);
    updateAvatarModel.assets = sections.assets.map(asset => ({
      id: asset.id,
      meta: asset.meta,
    }));
  }

  if (sections.emotes) {
    updateTypes.push(AvatarUpdateType.UpdateEmotes);
    updateAvatarConfig.emoteRequestModels = sections.emotes;
  }

  if (sections.backgroundAssetId !== undefined) {
    updateTypes.push(AvatarUpdateType.UpdateBackground);
    updateAvatarConfig.backgroundRequestModel = { id: sections.backgroundAssetId };
  }

  const request: UpdateAvatarRequestV4 = { updateTypes };
  const avatarDefinition: AvatarDefinitionV4 = {};
  if (Object.keys(updateAvatarModel).length > 0) {
    avatarDefinition.updateAvatarModel = updateAvatarModel;
  }
  if (Object.keys(updateAvatarConfig).length > 0) {
    avatarDefinition.updateAvatarConfig = updateAvatarConfig;
  }
  if (Object.keys(avatarDefinition).length > 0) {
    request.avatarDefinition = avatarDefinition;
  }
  return request;
};

// The V4 endpoint replaces the entire emote config with the array it receives, so an emote
// change sends every equipped emote, with the changed slot updated.

/** The emotes to send when equipping `assetId` at `position`. */
export const emotesAfterEquip = (
  currentEmotes: EmoteRequestModel[],
  assetId: number,
  position: number,
): EmoteRequestModel[] => [
  ...currentEmotes.filter(emote => emote.position !== position),
  { assetId, position },
];

/** The emotes to send when clearing the slot at `position`. */
export const emotesAfterUnequip = (
  currentEmotes: EmoteRequestModel[],
  position: number,
): EmoteRequestModel[] => currentEmotes.filter(emote => emote.position !== position);
