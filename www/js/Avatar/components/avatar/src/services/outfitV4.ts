/**
 * Request builders and response mappers for the `/v4/outfits/*` endpoints, shared by the .NET
 * and Next.js avatar services so both send the same V4 payloads.
 */

import type { AccoutrementAsset } from "@rbx/avatar-common";
import { AvatarType, TPatchOutfitResponse } from "../constants/types";
import avatarConstants from "../constants/avatarConstants";
import { AvatarScales } from "../avatarRequest";
import { OutfitDetailsV3 } from "../types";
import { BodyColorsStateV2, BodyColorsV2Request } from "../types/bodyColors.types";
import { AvatarBodyColorsV4 } from "../types/updateAvatarV4.types";
import {
  OutfitUpdateType,
  UpdateOutfitModelV4,
  UpdateOutfitConfigV4,
  UpdateOutfitDefinitionV4,
  CreateOutfitDefinitionRequestV4,
  UpdateOutfitDefinitionRequestV4,
  MutateOutfitDefinitionResponseV4,
  GetOutfitDefinitionResponseV4,
} from "../types/outfitV4.types";

/**
 * Normalizes body colors to the V4 `*Color` wire shape (`BodyColors3Model`). Accepts either
 * the `*Color3` request/response shape or the internal `*ColorId` (hex) shape.
 */
export const toV4BodyColors = (
  colors: BodyColorsV2Request | BodyColorsStateV2,
): AvatarBodyColorsV4 => {
  if ("headColor3" in colors) {
    return {
      headColor: colors.headColor3,
      torsoColor: colors.torsoColor3,
      leftArmColor: colors.leftArmColor3,
      leftLegColor: colors.leftLegColor3,
      rightArmColor: colors.rightArmColor3,
      rightLegColor: colors.rightLegColor3,
    };
  }
  return {
    headColor: colors.headColorId,
    torsoColor: colors.torsoColorId,
    leftArmColor: colors.leftArmColorId,
    leftLegColor: colors.leftLegColorId,
    rightArmColor: colors.rightArmColorId,
    rightLegColor: colors.rightLegColorId,
  };
};

// Maps the V4 numeric `PlayerAvatarType` to the editor's "R6"/"R15" string. R15=3 is the
// verified value; R6 is assumed 1 and 2 is also treated as R15 to cover the alternate
// R6=1/R15=2 convention. Passes through a string in case the enum is serialized by name.
export const mapPlayerAvatarType = (value: number | string): string => {
  if (typeof value === "string") {
    return value;
  }
  const byValue: Record<number, AvatarType> = { 1: "R6", 2: "R15", 3: "R15" };
  return byValue[value] ?? avatarConstants.avatarType.defaultOnPageLoad;
};

/**
 * `POST /v4/outfits/create` body. Builds the outfit definition (`updateOutfitModel` +
 * `updateOutfitConfig`) from the current avatar snapshot. The backend always creates an
 * `Avatar` outfit and auto-generates a name when omitted. Background is persisted via
 * `updateOutfitConfig.backgroundRequestModel` (`0` = no background).
 */
export const buildCreateOutfitRequestV4 = (
  name: string,
  bodyColor3s: BodyColorsV2Request | BodyColorsStateV2,
  assets: AccoutrementAsset[],
  scale: AvatarScales,
  playerAvatarType: string,
  backgroundAssetId?: number,
): CreateOutfitDefinitionRequestV4 => {
  const updateOutfitModel: UpdateOutfitModelV4 = {
    name,
    bodyColors: toV4BodyColors(bodyColor3s),
    scale,
    playerAvatarType: playerAvatarType as AvatarType,
    assets: assets.map(asset => ({ id: asset.id, meta: asset.meta })),
  };
  const outfitDefinition: UpdateOutfitDefinitionV4 = { updateOutfitModel };
  if (backgroundAssetId !== undefined) {
    outfitDefinition.updateOutfitConfig = { backgroundRequestModel: { id: backgroundAssetId } };
  }
  return { outfitDefinition };
};

/**
 * `PATCH /v4/outfits/{id}` body. Translates the partial outfit contents into the outfit
 * definition, declaring only the changed sections via `updateTypes` (a name-only patch sends
 * `["UpdateName"]`).
 */
export const buildPatchOutfitRequestV4 = (
  outfitContents: Partial<OutfitDetailsV3>,
): UpdateOutfitDefinitionRequestV4 => {
  const updateTypes: OutfitUpdateType[] = [];
  const updateOutfitModel: UpdateOutfitModelV4 = {};
  const updateOutfitConfig: UpdateOutfitConfigV4 = {};

  if (outfitContents.playerAvatarType) {
    updateTypes.push(OutfitUpdateType.UpdateAvatarType);
    updateOutfitModel.playerAvatarType = outfitContents.playerAvatarType as AvatarType;
  }
  if (outfitContents.bodyColor3s) {
    updateTypes.push(OutfitUpdateType.UpdateBodyColors);
    updateOutfitModel.bodyColors = toV4BodyColors(outfitContents.bodyColor3s);
  }
  if (outfitContents.assets) {
    updateTypes.push(OutfitUpdateType.UpdateAssets);
    updateOutfitModel.assets = (outfitContents.assets as unknown as AccoutrementAsset[]).map(
      asset => ({ id: asset.id, meta: asset.meta }),
    );
  }
  if (outfitContents.scale) {
    updateTypes.push(OutfitUpdateType.UpdateScales);
    updateOutfitModel.scale = outfitContents.scale;
  }
  if (outfitContents.name !== undefined) {
    updateTypes.push(OutfitUpdateType.UpdateName);
    updateOutfitModel.name = outfitContents.name;
  }
  if (outfitContents.backgroundAssetId !== undefined) {
    updateTypes.push(OutfitUpdateType.UpdateBackground);
    updateOutfitConfig.backgroundRequestModel = { id: outfitContents.backgroundAssetId };
  }

  const outfitDefinition: UpdateOutfitDefinitionV4 = {};
  if (Object.keys(updateOutfitModel).length > 0) {
    outfitDefinition.updateOutfitModel = updateOutfitModel;
  }
  if (Object.keys(updateOutfitConfig).length > 0) {
    outfitDefinition.updateOutfitConfig = updateOutfitConfig;
  }

  return { updateTypes, outfitDefinition };
};

/**
 * Maps the `PATCH /v4/outfits/{id}` response back to `TPatchOutfitResponse`. The V4 mutate
 * response nests the outfit summary under `outfit`. Read it defensively (tolerating a PascalCase
 * `Outfit` or a missing body) and fall back to the request values so a successful update is
 * never surfaced to the dialog as a client-side error.
 */
export const mapPatchOutfitResponseV4 = (
  response: MutateOutfitDefinitionResponseV4 | undefined,
  userOutfitId: number,
  outfitContents: Partial<OutfitDetailsV3>,
): TPatchOutfitResponse => {
  const data = (response ?? {}) as Partial<MutateOutfitDefinitionResponseV4> & {
    Outfit?: MutateOutfitDefinitionResponseV4["outfit"];
  };
  const outfit = data.outfit ?? data.Outfit;
  return {
    id: outfit?.id ?? userOutfitId,
    isEditable: outfit?.isEditable ?? true,
    name: outfit?.name ?? outfitContents.name ?? "",
    outfitType: outfit?.outfitType ?? null,
  };
};

/**
 * Maps `GET /v4/outfits/{id}/details` (`{ outfitModel, outfitConfigurations }`) back to
 * `OutfitDetailsV3` so existing outfit consumers (equip, list enrichment) are unchanged.
 */
export const mapGetOutfitDefinitionV4ToV3 = (
  response: GetOutfitDefinitionResponseV4,
): OutfitDetailsV3 => {
  const { outfitModel, outfitConfigurations } = response;
  return {
    id: outfitModel.id,
    universeId: outfitModel.universeId ?? 0,
    name: outfitModel.name,
    outfitType: outfitModel.outfitType as OutfitDetailsV3["outfitType"],
    isEditable: outfitModel.isEditable,
    moderationStatus: outfitModel.moderationStatus ?? null,
    scale: outfitModel.scale,
    playerAvatarType: mapPlayerAvatarType(outfitModel.playerAvatarType),
    // V4 body colors use `*Color` field names; map back to the outfit's `*Color3` shape.
    bodyColor3s: {
      headColor3: outfitModel.bodyColors.headColor,
      torsoColor3: outfitModel.bodyColors.torsoColor,
      rightArmColor3: outfitModel.bodyColors.rightArmColor,
      leftArmColor3: outfitModel.bodyColors.leftArmColor,
      rightLegColor3: outfitModel.bodyColors.rightLegColor,
      leftLegColor3: outfitModel.bodyColors.leftLegColor,
    },
    // Wire assets carry the fields the editor consumes as accoutrement assets.
    assets: outfitModel.assets as unknown as OutfitDetailsV3["assets"],
    // Background lives in the outfit configurations, which the service omits entirely when
    // the outfit has no background — so absence here means "no background", not "unknown",
    // and maps to `0` (an explicit clear on equip). Only the V3 read path, which drops
    // background support altogether, leaves this `undefined` to mean "leave untouched".
    backgroundAssetId: outfitConfigurations?.background?.backgroundAsset?.id ?? 0,
  };
};
