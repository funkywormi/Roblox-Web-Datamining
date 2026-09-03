import type { AccoutrementAsset } from "@rbx/avatar-common";
import { AvatarScales } from "../avatarRequest";
import { AvatarType } from "../constants/types";
import {
  AvatarBodyColorsV4,
  UpdateAvatarAsset,
  BackgroundRequestModel,
} from "./updateAvatarV4.types";

/**
 * Sections of an outfit that a single `PATCH /v4/outfits/{id}` request declares it wants to
 * change. Mirrors avatar-public-api's `Roblox.Api.Avatar.Models.Enums.OutfitUpdateType` and is
 * serialized as the enum member NAME (string), matching the API's `StringEnumConverter` usage.
 *
 * Unlike the avatar `AvatarUpdateType`, this includes `UpdateName` (outfits can be renamed) and
 * omits emotes / thumbnail customizations.
 */
export enum OutfitUpdateType {
  UpdateAvatarType = "UpdateAvatarType",
  UpdateBodyColors = "UpdateBodyColors",
  UpdateAssets = "UpdateAssets",
  UpdateScales = "UpdateScales",
  UpdateName = "UpdateName",
  UpdateBackground = "UpdateBackground",
}

/**
 * Write-form outfit model (mirrors `UpdateOutfitModel`). Body colors use the `*Color` field
 * names (`BodyColors3Model`) and scale/type/assets match the avatar write model.
 */
export type UpdateOutfitModelV4 = {
  name?: string;
  bodyColors?: AvatarBodyColorsV4;
  scale?: Partial<AvatarScales>;
  playerAvatarType?: AvatarType;
  assets?: UpdateAvatarAsset[];
};

/** Config-style outfit updates (mirrors `UpdateOutfitConfig`). Currently just the background. */
export type UpdateOutfitConfigV4 = {
  backgroundRequestModel?: BackgroundRequestModel;
};

/** Wrapper carried by create/update requests (mirrors the write-form `OutfitDefinition`). */
export type UpdateOutfitDefinitionV4 = {
  updateOutfitModel?: UpdateOutfitModelV4;
  updateOutfitConfig?: UpdateOutfitConfigV4;
};

/** `POST /v4/outfits/create` request body. */
export type CreateOutfitDefinitionRequestV4 = {
  outfitDefinition: UpdateOutfitDefinitionV4;
};

/**
 * `PATCH /v4/outfits/{id}` request body. Only the sections named in `updateTypes` are applied,
 * so a rename can send just `{ updateTypes: ["UpdateName"], outfitDefinition: { updateOutfitModel: { name } } }`.
 */
export type UpdateOutfitDefinitionRequestV4 = {
  updateTypes: OutfitUpdateType[];
  outfitDefinition: UpdateOutfitDefinitionV4;
};

/** Outfit summary returned by create/update (mirrors `OutfitModel`). */
export type OutfitModelResponseV4 = {
  id: number;
  name: string;
  isEditable: boolean;
  outfitType: string | null;
};

export type InvalidBackgroundResponseV4 = {
  backgroundAssetId: number;
  error: string;
};

/**
 * Response shape shared by `POST /v4/outfits/create` (`CreateOutfitDefinitionResponseV4`) and
 * `PATCH /v4/outfits/{id}` (`UpdateOutfitDefinitionResponseV4`).
 */
export type MutateOutfitDefinitionResponseV4 = {
  outfit: OutfitModelResponseV4;
  invalidAssets?: unknown[];
  invalidBackground?: InvalidBackgroundResponseV4[] | null;
  success: boolean;
};

/**
 * Read-form outfit model returned inside `GET /v4/outfits/{id}/details`.
 *
 * NOTE: The exact field names of `OutfitModelV4` / `OutfitConfigurations` are inferred from the
 * parallel V4 avatar read shape (`GET /v4/avatar`). Confirm against the backend models; the
 * mapping in `avatarAPIService.mapGetOutfitDefinitionV4ToV3` is the single place to adjust.
 */
export type OutfitModelV4 = {
  id: number;
  universeId?: number | null;
  name: string;
  isEditable: boolean;
  outfitType: string;
  moderationStatus?: string | null;
  scale: AvatarScales;
  // Numeric on the wire (R6/R15); tolerates a string if the enum serializes by name.
  playerAvatarType: number | string;
  bodyColors: AvatarBodyColorsV4;
  assets: AccoutrementAsset[];
};

export type OutfitConfigurationsV4 = {
  background?: { backgroundAsset?: AccoutrementAsset | null } | null;
};

/** `GET /v4/outfits/{id}/details` response (the read-form `OutfitDefinition`). */
export type GetOutfitDefinitionResponseV4 = {
  outfitModel: OutfitModelV4;
  outfitConfigurations?: OutfitConfigurationsV4;
};
