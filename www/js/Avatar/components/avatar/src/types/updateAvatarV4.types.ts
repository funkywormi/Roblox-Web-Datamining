import type { AccoutrementAsset } from "@rbx/avatar-common";
import { AvatarScales } from "../avatarRequest";
import { AvatarType } from "../constants/types";
import { BodyColorsStateV2 } from "./bodyColors.types";

/**
 * Sections of the avatar that a single `PATCH /v4/avatar` (UpdateAvatarV4Operation) request
 * declares it wants to change. Mirrors avatar-public-api's `Roblox.Api.Avatar.Models.Enums`
 * `AvatarUpdateType`.
 *
 * Serialized to the wire as the enum member NAME (string), matching the API's
 * `StringEnumConverter` usage (the same pattern `UpdateAvatarModelV4.PlayerAvatarType` uses).
 * Sending the numeric value instead produces a 400 when integer values are disallowed.
 *
 * Numeric equivalents (for reference): Invalid=0, UpdateScales=1, UpdateAvatarType=2,
 * UpdateBodyColors=3, UpdateAssets=4, UpdateEmotes=5, UpdateThumbnailCustomizations=6,
 * UpdateBackground=7.
 */
export enum AvatarUpdateType {
  Invalid = "Invalid",
  UpdateScales = "UpdateScales",
  UpdateAvatarType = "UpdateAvatarType",
  UpdateBodyColors = "UpdateBodyColors",
  UpdateAssets = "UpdateAssets",
  UpdateEmotes = "UpdateEmotes",
  UpdateThumbnailCustomizations = "UpdateThumbnailCustomizations",
  UpdateBackground = "UpdateBackground",
}

/**
 * V4 body colors wire shape. Mirrors avatar-public-api's `BodyColorsModelV4`, which replaced
 * the older `BodyColors3Model` and uses plain `*Color` field names (no `3` suffix).
 */
export type AvatarBodyColorsV4 = {
  headColor: string;
  torsoColor: string;
  rightArmColor: string;
  leftArmColor: string;
  rightLegColor: string;
  leftLegColor: string;
};

export type UpdateAvatarAsset = {
  id: number;
  meta?: AccoutrementAsset["meta"];
};

/** Core avatar model: scales, type, colors, assets. Mirrors C# `UpdateAvatarModelV4`. */
export type UpdateAvatarModelV4 = {
  scales?: Partial<AvatarScales>;
  playerAvatarType?: AvatarType;
  bodyColors?: AvatarBodyColorsV4;
  assets?: UpdateAvatarAsset[];
};

export type EmoteRequestModel = {
  assetId: number;
  position: number;
};

export type BackgroundRequestModel = {
  id: number;
};

export type UpdateAvatarConfigV4 = {
  emoteRequestModels?: EmoteRequestModel[];
  thumbnailCustomizationModels?: unknown[];
  backgroundRequestModel?: BackgroundRequestModel;
};

/**
 * Wrapper carried by the request. Holds the core avatar model and the config-style updates.
 *   Request -> avatarDefinition -> { updateAvatarModel, updateAvatarConfig }
 */
export type AvatarDefinitionV4 = {
  updateAvatarModel?: UpdateAvatarModelV4;
  updateAvatarConfig?: UpdateAvatarConfigV4;
};

export type UpdateAvatarRequestV4 = {
  updateTypes: AvatarUpdateType[];
  avatarDefinition?: AvatarDefinitionV4;
};

/**
 * An asset the server refused to apply (wear). The V4 avatar mutations return the full asset
 * objects (id, name, assetType, meta, ...) rather than the legacy numeric ids; we only rely on
 * `id`, so the rest is kept loose.
 */
export type InvalidAssetV4 = {
  id: number;
  [key: string]: unknown;
};

/**
 * Validation details returned by V4 avatar mutations when one or more inputs could not be
 * applied. `null`/absent when everything succeeded. Mirrors C# `AvatarValidationResultV4`.
 *
 * Note: invalid assets are surfaced under `invalidAssets` (full asset objects), matching the
 * top-level `invalidAssets` on the response — this is the successor of the old top-level
 * `invalidAssetIds` (which carried numeric ids).
 */
export type AvatarValidationResultV4 = {
  invalidAssets?: InvalidAssetV4[];
  invalidBackground?: unknown[];
  invalidProfileFrame?: unknown[];
  invalidEmotes?: unknown[];
  invalidThumbnailCustomizations?: unknown[];
};

export type UpdateAvatarResponseV4 = {
  success: boolean;
  /**
   * Legacy `setWearingAssets` (v2) shape: numeric ids of assets that could not be worn.
   * Absent on the consolidated `PATCH /v4/avatar` path — see `invalidAssets` / `validation`.
   */
  invalidAssetIds?: number[];
  /** Consolidated `PATCH /v4/avatar` shape: full asset objects that could not be worn. */
  invalidAssets?: InvalidAssetV4[];
  validation?: AvatarValidationResultV4 | null;
};

/**
 * `GET /v4/avatar` returns an `AvatarDefinition` = `{ avatarModel, avatarConfigurations }`
 * (Roblox.Api.Avatar.Models.V4). Mapped back to `AvatarConfigV2` so existing consumers are
 * unaffected. The endpoint requires a `selectionTypes` query param (integer values 0-5).
 */
export type AvatarModelV4 = {
  scales: AvatarScales;
  // Numeric on the wire (e.g. R6/R15); mapped to the editor's "R6"/"R15" string form.
  // Tolerates a string in case the endpoint serializes the enum name instead.
  playerAvatarType: number | string;
  bodyColors: AvatarBodyColorsV4;
  assets: AccoutrementAsset[];
};

export type AvatarConfigurationEmoteV4 = {
  assetId: number;
  assetName: string;
  position: number;
};

export type AvatarConfigurationsV4 = {
  emotes?: AvatarConfigurationEmoteV4[];
  background?: { backgroundAsset?: AccoutrementAsset | null } | null;
  thumbnailCustomizations?: unknown[];
};

export type GetAvatarResponseV4 = {
  avatarModel: AvatarModelV4;
  avatarConfigurations?: AvatarConfigurationsV4;
};

/**
 * Caller-friendly description of the avatar sections to change. Any subset can be supplied;
 * only the provided sections are added to `updateTypes` and the request payload. This is the
 * single entry point for the consolidated save (all sections in one `PATCH /v4/avatar`).
 *
 * Body colors are accepted in the editor's internal hex form (`BodyColorsStateV2`) and mapped
 * to the V4 wire's `*Color` field names (`BodyColorsModelV4`).
 */
export type AvatarUpdateSections = {
  bodyColors?: BodyColorsStateV2;
  scales?: Partial<AvatarScales>;
  avatarType?: AvatarType;
  assets?: AccoutrementAsset[];
  emotes?: EmoteRequestModel[];
  /** Profile background asset id. Pass `0` to clear the background. */
  backgroundAssetId?: number;
};
