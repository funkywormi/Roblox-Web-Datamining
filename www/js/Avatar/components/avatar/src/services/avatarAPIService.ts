import { AxiosError } from "@rbx/core-scripts/http";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { generateAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import environmentUrls from "@rbx/environment-urls";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { getCurrentUserId } from "../utils/currentUser";
import {
  TSetBodyColors,
  AvatarType,
  TGenericItemDetails,
  TPatchOutfitResponse,
  TAvatarInventoryItem,
} from "../constants/types";
import avatarUrlConstants from "../constants/avatarUrlConstants";
import avatarConstants from "../constants/avatarConstants";
import { PlayerAvatarConfig } from "../avatarRules";
import { AvatarConfig, AvatarConfigV2, AvatarScales } from "../avatarRequest";
import { CatalogSettings } from "../catalogMetadataRequest";
import { AvatarAppPolicy } from "../avatarAppPolicy";
import { AvatarSettings } from "../metadataRequest";
import { AvatarItemAvailabilityStatus, CatalogItem, CatalogOutfitItem } from "../avatar.types";
import { OutfitDetails, OutfitDetailsV3 } from "../types";
import { BodyColorsStateV2, BodyColorsV2Request } from "../types/bodyColors.types";
import {
  AvatarUpdateType,
  AvatarDefinitionV4,
  UpdateAvatarModelV4,
  UpdateAvatarConfigV4,
  EmoteRequestModel,
  AvatarUpdateSections,
  UpdateAvatarRequestV4,
  UpdateAvatarResponseV4,
  GetAvatarResponseV4,
  AvatarBodyColorsV4,
  AvatarValidationResultV4,
  InvalidAssetV4,
} from "../types/updateAvatarV4.types";
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
import { preserveJsonNumberPrecision } from "../utils/preserveJsonNumberPrecision";
import AvatarAPIServiceNextJs from "./avatarAPIService.nextjs";

// httpService from legacy-core-utilities doesn't propagate its generic into .then(),
// so we use this typed helper to unwrap .data without implicit any.
const unwrapData = <T>(r: { data: T }): T => r.data;

type InventoryAsset = {
  assetId: number;
  name: string;
  assetType: string;
  created: string; // ISO date as string
};

export type ErrorData = {
  errors: AxiosError[]; // An array of ApiError objects
};

export type OutfitsResponse = {
  data: CatalogOutfitItem[];
  paginationToken: string | undefined;
};

export type RecentItemsResponse = {
  data: CatalogItem[];
  total: number;
};

export type PostItemDetailsResponse = {
  data: TGenericItemDetails[];
};

export type GetInventoryItemsResponse = {
  data: InventoryAsset[];
  nextPageCursor: string | null;
  isValid: boolean;
  error?: string;
};

export type AvatarResponseBase = {
  success: boolean;
  error?: any;
};

export type GetEmotesResponse = InventoryEmote[];

export type InventoryEmote = {
  position: number;
  assetName: string;
  assetId: number;
};

export type GetUserCurrencyResponse = {
  robux: number;
};

export type GetFeatureAccessResponse = {
  features: FeatureAccess[];
};

export type FeatureAccess = {
  featureName: string;
  access: string;
  v2Recourses: V2Resource[];
  recourse: string | null | undefined;
  shouldPrompt: boolean | undefined;
};

export type V2Resource = {
  action: string;
  timedOutActions: timeoutAction[];
};

export type timeoutAction = {
  featureVector: string;
  endTime: string;
  startTime: string;
  duration: number;
};

export type SetBodyColorsResponse = AvatarResponseBase;

export type SetBodyScalesResponse = AvatarResponseBase;

export type SetAvatarTypeResponse = AvatarResponseBase;

export type SetWearingAssetsResponse = AvatarResponseBase & {
  /** Legacy `POST setWearingAssets` (v2) shape: numeric ids that could not be worn. */
  invalidAssetIds?: number[];
  /** Consolidated `PATCH /v4/avatar` shape: full asset objects that could not be worn. */
  invalidAssets?: InvalidAssetV4[];
  /** V4 validation breakdown (also carries `invalidAssets`). */
  validation?: AvatarValidationResultV4 | null;
};

export type AvatarInventoryItem = {
  acquisitionTime: string; // ISO date as string
  expirationTime: string | undefined; // null or ISO date as string
  itemCategory: {
    itemType: number;
    itemSubType: number;
  };
  itemId: number;
  itemName: string;
  lastEquipTime: string | null; // null or ISO date as string
  isEditable?: boolean;
  headShape?: string;
  availabilityStatus?: AvatarItemAvailabilityStatus;
  outfitDetail?: {
    // 64-bit long on the wire; rewritten to string by preserveJsonNumberPrecision.
    linkedEntityId?: string;
    linkedEntityType?: "Look" | "Bundle";
  };
};

export type GetAvatarInventoryResponse = {
  avatarInventoryItems: AvatarInventoryItem[];
  nextPageToken: string | null;
};

/**
 * Extracts the ids of assets the server refused to apply, tolerating both response shapes:
 *  - legacy `setWearingAssets` (v2): `invalidAssetIds: number[]`
 *  - consolidated `PATCH /v4/avatar` (v4): the same information moved to `invalidAssets`
 *    (full asset objects, top-level) and/or `validation.invalidAssets`.
 *
 * Returns an empty array for responses that carry no invalid-asset information (e.g. body
 * color / scale / avatar-type mutations).
 */
export function getInvalidAssetIds(response: AvatarResponseBase | null | undefined): number[] {
  if (!response) {
    return [];
  }
  const wearing = response as SetWearingAssetsResponse;

  // v2 / legacy: explicit numeric ids.
  if (Array.isArray(wearing.invalidAssetIds)) {
    return wearing.invalidAssetIds;
  }

  // v4: full asset objects, either top-level or under `validation`. Prefer the top-level list
  // (they mirror each other) to avoid double counting.
  const v4InvalidAssets = wearing.invalidAssets ?? wearing.validation?.invalidAssets;
  if (Array.isArray(v4InvalidAssets)) {
    return v4InvalidAssets
      .map(asset => asset?.id)
      .filter((id): id is number => typeof id === "number");
  }

  return [];
}

// All `selectionTypes` accepted by `GET /v4/avatar` (integer values 0-5). Requesting every
// section returns the full avatar definition (model + configurations) for the editor.
const AVATAR_V4_SELECTION_TYPES = [0, 1, 2, 3, 4, 5];

// Named export alongside the default: the default is a build-time union of this and the
// Next.js implementation, so it cannot type-check calls to members only one of them has.
// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AvatarAPIService {
  // When true, the legacy equip endpoints route through the consolidated
  // `PATCH /v4/avatar` (UpdateAvatar) endpoint instead. Set once via `configure`.
  private static isUpdateAvatarV4Enabled = false;

  // When true, the avatar read path uses `GET /v4/avatar` instead of `/v2/avatar/avatar`.
  private static isGetAvatarV4Enabled = false;

  // When true, outfit create/update/details route through the `/v4/outfits/*` endpoints, which
  // carry the outfit definition and persist the profile background.
  private static isOutfitApiV4Enabled = false;

  static configure(
    settings: Pick<
      AvatarSettings,
      "isUpdateAvatarV4Enabled" | "isGetAvatarV4Enabled" | "isOutfitApiV4Enabled"
    >,
  ): void {
    AvatarAPIService.isUpdateAvatarV4Enabled = settings.isUpdateAvatarV4Enabled;
    AvatarAPIService.isGetAvatarV4Enabled = settings.isGetAvatarV4Enabled;
    AvatarAPIService.isOutfitApiV4Enabled = settings.isOutfitApiV4Enabled;
  }

  static avatarApi(url: string, pathParams: Record<string, string | number> = {}): string {
    const absoluteUrl = generateAbsoluteUrl(
      url,
      Object.fromEntries(Object.entries(pathParams).map(([k, v]) => [k, String(v)])),
      true,
    );
    return `${environmentUrls.avatarApi}${absoluteUrl}`;
  }

  static catalogApi(url: string, pathParams: Record<string, string | number> = {}): string {
    const absoluteUrl = generateAbsoluteUrl(
      url,
      Object.fromEntries(Object.entries(pathParams).map(([k, v]) => [k, String(v)])),
      true,
    );
    return `${environmentUrls.catalogApi}${absoluteUrl}`;
  }

  static inventoryApi(url: string, pathParams: Record<string, string | number> = {}): string {
    const absoluteUrl = generateAbsoluteUrl(
      url,
      Object.fromEntries(Object.entries(pathParams).map(([k, v]) => [k, String(v)])),
      true,
    );
    return `${environmentUrls.inventoryApi}${absoluteUrl}`;
  }

  static economyApi(url: string, pathParams: Record<string, string | number> = {}): string {
    const absoluteUrl = generateAbsoluteUrl(
      url,
      Object.fromEntries(Object.entries(pathParams).map(([k, v]) => [k, String(v)])),
      true,
    );
    return `${environmentUrls.economyApi}${absoluteUrl}`;
  }

  static api(url: string, pathParams: Record<string, string | number> = {}): string {
    const absoluteUrl = generateAbsoluteUrl(
      url,
      Object.fromEntries(Object.entries(pathParams).map(([k, v]) => [k, String(v)])),
      true,
    );
    return `${environmentUrls.apiGatewayUrl}${absoluteUrl}`;
  }

  static getOutfitDetails(userOutfitId: number): Promise<OutfitDetails> {
    // Prefer V3 endpoint for hex colors, but keep V1 for backward compatibility
    console.warn(
      "getOutfitDetails (v1) is deprecated. Consider using getOutfitDetailsV3 for hex color support.",
    );
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getOutfitDetailsUrl, {
      id: userOutfitId,
    });
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.get<OutfitDetails>(config).then(unwrapData);
  }

  static getOutfitDetailsV3(userOutfitId: number): Promise<OutfitDetailsV3> {
    if (AvatarAPIService.isOutfitApiV4Enabled) {
      return AvatarAPIService.getOutfitDetailsV4(userOutfitId);
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.getOutfitDetailsUrlV3, {
      id: userOutfitId,
    });
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.get<OutfitDetailsV3>(config).then(unwrapData);
  }

  /**
   * `GET /v4/outfits/{id}/details`. Returns the outfit definition (`{ outfitModel,
   * outfitConfigurations }`) and maps it back to `OutfitDetailsV3` so existing outfit consumers
   * (equip, list enrichment) are unchanged.
   */
  static getOutfitDetailsV4(userOutfitId: number): Promise<OutfitDetailsV3> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getOutfitDetailsUrlV4, {
      id: userOutfitId,
    });
    const config = {
      url,
      withCredentials: true,
    };
    return httpService
      .get<GetOutfitDefinitionResponseV4>(config)
      .then((r: { data: GetOutfitDefinitionResponseV4 }) =>
        AvatarAPIService.mapGetOutfitDefinitionV4ToV3(r.data),
      );
  }

  static mapGetOutfitDefinitionV4ToV3(response: GetOutfitDefinitionResponseV4): OutfitDetailsV3 {
    const { outfitModel, outfitConfigurations } = response;
    return {
      id: outfitModel.id,
      universeId: outfitModel.universeId ?? 0,
      name: outfitModel.name,
      outfitType: outfitModel.outfitType as OutfitDetailsV3["outfitType"],
      isEditable: outfitModel.isEditable,
      moderationStatus: outfitModel.moderationStatus ?? null,
      scale: outfitModel.scale,
      playerAvatarType: AvatarAPIService.mapPlayerAvatarType(outfitModel.playerAvatarType),
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
  }

  /**
   * Normalizes body colors to the V4 `*Color` wire shape (`BodyColors3Model`). Accepts either
   * the `*Color3` request/response shape or the internal `*ColorId` (hex) shape.
   */
  private static toV4BodyColors(
    colors: BodyColorsV2Request | BodyColorsStateV2,
  ): AvatarBodyColorsV4 {
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
  }

  static createOutfit(
    name: string,
    bodyColors: TSetBodyColors,
    assets: AccoutrementAsset[],
    scale: AvatarScales,
    playerAvatarType: string,
    backgroundAssetId?: number,
  ): Promise<void> {
    // Since all APIs should use hex colors now, prefer V3 endpoint
    // Check if bodyColors exists and has hex string values
    if (
      bodyColors &&
      typeof bodyColors === "object" &&
      bodyColors !== null &&
      "headColorId" in bodyColors &&
      typeof (bodyColors as BodyColorsStateV2).headColorId === "string"
    ) {
      // Convert hex colors to v3 format and use v3 endpoint
      return this.createOutfitV3(
        name,
        bodyColors as BodyColorsStateV2,
        assets,
        scale,
        playerAvatarType,
        backgroundAssetId,
      );
    }

    // If bodyColors is undefined or has number IDs, we should still try to create the outfit
    // but warn that hex colors should be used
    console.warn(
      "createOutfit: bodyColors is undefined or contains number IDs. All APIs should use hex colors.",
      "bodyColors:",
      bodyColors,
    );

    // Use v2 endpoint as fallback, but this should be migrated to use hex colors
    const url = this.avatarApi(avatarUrlConstants.avatarApi.createOutfitUrl);

    const params: Record<string, unknown> = { name, bodyColors, assets, scale, playerAvatarType };
    if (backgroundAssetId !== undefined) {
      params.backgroundAssetId = backgroundAssetId;
    }
    return httpService.post<void>({ url, withCredentials: true }, params).then(unwrapData);
  }

  static createOutfitV3(
    name: string,
    bodyColor3s: BodyColorsV2Request | BodyColorsStateV2,
    assets: AccoutrementAsset[],
    scale: AvatarScales,
    playerAvatarType: string,
    backgroundAssetId?: number,
  ): Promise<void> {
    // Check if bodyColor3s is provided
    if (!bodyColor3s) {
      throw new Error("bodyColor3s is required for createOutfitV3");
    }

    if (AvatarAPIService.isOutfitApiV4Enabled) {
      // The V4 create response carries { outfit, invalidAssets, ... };
      // callers of createOutfitV3 don't read the body, so drop it to keep the void contract.
      return AvatarAPIService.createOutfitV4(
        name,
        bodyColor3s,
        assets,
        scale,
        playerAvatarType,
        backgroundAssetId,
      ).then(() => undefined);
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.createOutfitUrlV3);

    // bodyColor3s is already in the correct Color3 format from the API. Only send
    // backgroundAssetId when known so we never overwrite a saved background with `undefined`.
    const params: Record<string, unknown> = { name, bodyColor3s, assets, scale, playerAvatarType };
    if (backgroundAssetId !== undefined) {
      params.backgroundAssetId = backgroundAssetId;
    }
    return httpService.post<void>({ url, withCredentials: true }, params).then(unwrapData);
  }

  /**
   * `POST /v4/outfits/create`. Builds the outfit definition (`updateOutfitModel` +
   * `updateOutfitConfig`) from the current avatar snapshot. The backend always creates an
   * `Avatar` outfit and auto-generates a name when omitted. Background is persisted via
   * `updateOutfitConfig.backgroundRequestModel` (`0` = no background).
   */
  static createOutfitV4(
    name: string,
    bodyColor3s: BodyColorsV2Request | BodyColorsStateV2,
    assets: AccoutrementAsset[],
    scale: AvatarScales,
    playerAvatarType: string,
    backgroundAssetId?: number,
  ): Promise<MutateOutfitDefinitionResponseV4> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.createOutfitUrlV4);

    const updateOutfitModel: UpdateOutfitModelV4 = {
      name,
      bodyColors: AvatarAPIService.toV4BodyColors(bodyColor3s),
      scale,
      playerAvatarType: playerAvatarType as AvatarType,
      assets: assets.map(asset => ({ id: asset.id, meta: asset.meta })),
    };
    const outfitDefinition: UpdateOutfitDefinitionV4 = { updateOutfitModel };
    if (backgroundAssetId !== undefined) {
      outfitDefinition.updateOutfitConfig = { backgroundRequestModel: { id: backgroundAssetId } };
    }

    const body: CreateOutfitDefinitionRequestV4 = { outfitDefinition };
    return httpService
      .post<MutateOutfitDefinitionResponseV4>({ url, withCredentials: true }, body)
      .then(unwrapData);
  }

  static patchOutfit(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetails>,
  ): Promise<TPatchOutfitResponse> {
    // Prefer using patchOutfitV3 for hex color support
    console.warn("patchOutfit (v2) is deprecated. Use patchOutfitV3 for hex color support.");

    const url = this.avatarApi(avatarUrlConstants.avatarApi.patchOutfitUrl, { id: userOutfitId });
    return httpService
      .patch<TPatchOutfitResponse>({ url, withCredentials: true }, outfitContents)
      .then(unwrapData);
  }

  static patchOutfitV3(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    if (AvatarAPIService.isOutfitApiV4Enabled) {
      return AvatarAPIService.patchOutfitV4(userOutfitId, outfitContents);
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.patchOutfitUrlV3, { id: userOutfitId });
    return httpService
      .patch<TPatchOutfitResponse>({ url, withCredentials: true }, outfitContents)
      .then(unwrapData);
  }
  /**
   * `PATCH /v4/outfits/{id}`. Translates the partial outfit contents into the outfit definition,
   * declaring only the changed sections via `updateTypes` (a name-only patch sends
   * `["UpdateName"]`). Maps the nested `{ outfit }` response back to `TPatchOutfitResponse`.
   */
  static patchOutfitV4(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.patchOutfitUrlV4, { id: userOutfitId });

    const updateTypes: OutfitUpdateType[] = [];
    const updateOutfitModel: UpdateOutfitModelV4 = {};
    const updateOutfitConfig: UpdateOutfitConfigV4 = {};

    if (outfitContents.playerAvatarType) {
      updateTypes.push(OutfitUpdateType.UpdateAvatarType);
      updateOutfitModel.playerAvatarType = outfitContents.playerAvatarType as AvatarType;
    }
    if (outfitContents.bodyColor3s) {
      updateTypes.push(OutfitUpdateType.UpdateBodyColors);
      updateOutfitModel.bodyColors = AvatarAPIService.toV4BodyColors(outfitContents.bodyColor3s);
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

    const body: UpdateOutfitDefinitionRequestV4 = { updateTypes, outfitDefinition };
    return httpService
      .patch<MutateOutfitDefinitionResponseV4>({ url, withCredentials: true }, body)
      .then((r: { data: MutateOutfitDefinitionResponseV4 }) => {
        // The V4 mutate response nests the outfit summary under `outfit`. Read it defensively
        // (tolerating a PascalCase `Outfit` or a missing body) and fall back to the request
        // values so a successful update is never surfaced to the dialog as a client-side error.
        const data = (r.data ?? {}) as Partial<MutateOutfitDefinitionResponseV4> & {
          Outfit?: MutateOutfitDefinitionResponseV4["outfit"];
        };
        const outfit = data.outfit ?? data.Outfit;
        return {
          id: outfit?.id ?? userOutfitId,
          isEditable: outfit?.isEditable ?? true,
          name: outfit?.name ?? outfitContents.name ?? "",
          outfitType: outfit?.outfitType ?? null,
        };
      });
  }

  static deleteOutfit(userOutfitId: number): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.deleteOutfitUrl, { id: userOutfitId });
    return httpService.post<void>({ url, withCredentials: true }).then(unwrapData);
  }

  static getOutfits(
    userId: string,
    pageNumber: number,
    itemsPerPage: number,
    isEditable: boolean,
    outfitType?: string,
  ): Promise<unknown> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getOutfitsUrl, { userId });
    const config = {
      url,
      retryable: true,
      withCredentials: true,
    };

    const params = { itemsPerPage, page: pageNumber, isEditable, outfitType };
    return httpService.get<any>(config, params).then(unwrapData);
  }

  static getOutfitsV2(
    userId: string,
    paginationToken: string | undefined,
    itemsPerPage: number,
    isEditable: boolean,
    outfitType?: string,
  ): Promise<OutfitsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getOutfitsUrlV2, { userId });
    const config = {
      url,
      retryable: true,
      withCredentials: true,
    };

    let params: Record<string, unknown> = { itemsPerPage, isEditable, outfitType };
    if (paginationToken) {
      params = { ...params, paginationToken };
    }
    return httpService.get<OutfitsResponse>(config, params).then(unwrapData);
  }

  /**
   * Consolidated partial-update endpoint that replaces the legacy equip endpoints.
   * `updateTypes` declares which avatar sections the request changes; only those sections
   * need to be present in `avatarDefinition` / `updateAvatarConfig`.
   */
  static updateAvatar<T = UpdateAvatarResponseV4>(request: UpdateAvatarRequestV4): Promise<T> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.updateAvatarUrlV4);
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.patch<T>(config, request).then(unwrapData);
  }

  /**
   * Consolidated save: send any combination of avatar sections (colors, scales, avatar type,
   * assets, emotes, background) in a single `PATCH /v4/avatar` request.
   */
  static saveAvatar<T = UpdateAvatarResponseV4>(sections: AvatarUpdateSections): Promise<T> {
    return AvatarAPIService.updateAvatar<T>(AvatarAPIService.buildAvatarUpdateRequest(sections));
  }

  /**
   * Composes an `UpdateAvatarRequestV4` from the provided sections. Only sections that are
   * present are declared in `updateTypes` and serialized into the payload.
   */
  static buildAvatarUpdateRequest(sections: AvatarUpdateSections): UpdateAvatarRequestV4 {
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
  }

  static buildBodyColorsUpdateRequest(bodyColors: BodyColorsStateV2): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ bodyColors });
  }

  static buildScalesUpdateRequest(scales: Partial<AvatarScales>): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ scales });
  }

  static buildAvatarTypeUpdateRequest(avatarType: AvatarType): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ avatarType });
  }

  static buildWearingAssetsUpdateRequest(assets: AccoutrementAsset[]): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ assets });
  }

  static buildEmotesUpdateRequest(emotes: EmoteRequestModel[]): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ emotes });
  }

  static buildBackgroundUpdateRequest(backgroundAssetId: number): UpdateAvatarRequestV4 {
    return AvatarAPIService.buildAvatarUpdateRequest({ backgroundAssetId });
  }

  static setBodyColors(bodyColors: TSetBodyColors): Promise<SetBodyColorsResponse> {
    // Check if bodyColors has string values (V2 format) and use V2 endpoint
    const hasColorId = "headColorId" in bodyColors;
    const hasColor3 = "headColor3" in bodyColors;

    if (hasColorId && typeof (bodyColors as BodyColorsStateV2).headColorId === "string") {
      // Internal V2 format (headColorId with hex strings)
      return this.setBodyColorsV2(bodyColors as BodyColorsStateV2);
    }

    if (hasColor3) {
      // Outfit details V2 format (headColor3 with hex strings) - convert to internal format
      const outfitColors = bodyColors as {
        headColor3: string;
        torsoColor3: string;
        rightArmColor3: string;
        leftArmColor3: string;
        rightLegColor3: string;
        leftLegColor3: string;
      };

      const convertedBodyColors: BodyColorsStateV2 = {
        headColorId: outfitColors.headColor3,
        torsoColorId: outfitColors.torsoColor3,
        rightArmColorId: outfitColors.rightArmColor3,
        leftArmColorId: outfitColors.leftArmColor3,
        rightLegColorId: outfitColors.rightLegColor3,
        leftLegColorId: outfitColors.leftLegColor3,
      };
      return this.setBodyColorsV2(convertedBodyColors);
    }

    // V1 format (number IDs)
    const url = this.avatarApi(avatarUrlConstants.avatarApi.setBodyColorsUrl);
    const config = {
      url,
      withCredentials: true,
    };

    return httpService.post<SetBodyColorsResponse>(config, bodyColors).then(unwrapData);
  }

  static setBodyColorsV2(bodyColors: BodyColorsStateV2): Promise<SetBodyColorsResponse> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      return AvatarAPIService.updateAvatar<SetBodyColorsResponse>(
        AvatarAPIService.buildBodyColorsUpdateRequest(bodyColors),
      );
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.setBodyColorsUrlV2);

    // Convert from internal format to API request format
    const requestBody: BodyColorsV2Request = {
      headColor3: bodyColors.headColorId,
      torsoColor3: bodyColors.torsoColorId,
      rightArmColor3: bodyColors.rightArmColorId,
      leftArmColor3: bodyColors.leftArmColorId,
      rightLegColor3: bodyColors.rightLegColorId,
      leftLegColor3: bodyColors.leftLegColorId,
    };

    const config = {
      url,
      withCredentials: true,
    };

    return httpService.post<SetBodyColorsResponse>(config, requestBody).then(unwrapData);
  }

  static setWearingAssets(assetIds: number[]): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.setWearingAssetsUrl);

    const config = {
      url,
      withCredentials: true,
    };

    const params = { assetIds };
    return httpService.post<void>(config, params).then(unwrapData);
  }

  static setWearingAssetsV2(assets: AccoutrementAsset[]): Promise<SetWearingAssetsResponse> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      return AvatarAPIService.updateAvatar<SetWearingAssetsResponse>(
        AvatarAPIService.buildWearingAssetsUpdateRequest(assets),
      );
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.setWearingAssetsUrlV2);

    const config = {
      url,
      withCredentials: true,
    };

    const params = { assets };
    return httpService.post<SetWearingAssetsResponse>(config, params).then(unwrapData);
  }

  static wearAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.wearAssetUrl, { id: assetId });

    const config = {
      url,
      withCredentials: true,
    };

    return httpService.post<SetWearingAssetsResponse>(config).then(unwrapData);
  }

  static removeAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.removeAssetUrl, { id: assetId });

    const config = {
      url,
      withCredentials: true,
    };

    return httpService.post<SetWearingAssetsResponse>(config).then(unwrapData);
  }

  static wearOutfit(userOutfitId: number): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.wearOutfitUrl, { id: userOutfitId });

    const config = {
      url,
      withCredentials: true,
    };

    return httpService.post<void>(config).then(unwrapData);
  }

  static getAvatar(retry = true): Promise<AvatarConfig> {
    // Prefer V2 endpoint for hex colors, but keep V1 for backward compatibility
    console.warn("getAvatar (v1) is deprecated. Consider using getAvatarV2 for hex color support.");
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getAvatarUrl);
    const config = { url, withCredentials: true, retryable: retry };

    return httpService.get<AvatarConfig>(config).then(unwrapData);
  }

  static getAvatarV2(retry = true): Promise<AvatarConfigV2> {
    if (AvatarAPIService.isGetAvatarV4Enabled) {
      return AvatarAPIService.getAvatarV4(retry);
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.getAvatarUrlV2);
    const config = { url, withCredentials: true, retryable: retry };

    return httpService.get<AvatarConfigV2>(config).then(unwrapData);
  }

  static getAvatarV4(retry = true): Promise<AvatarConfigV2> {
    // `selectionTypes` (integer values 0-5) is a required query param declaring which avatar
    // data to return. Request all sections so the editor receives the full avatar definition.
    // Serialized as repeated keys (`selectionTypes=0&selectionTypes=1&...`) for ASP.NET binding.
    const selectionTypesQuery = AVATAR_V4_SELECTION_TYPES.map(
      type => `selectionTypes=${type}`,
    ).join("&");
    const url = `${this.avatarApi(
      avatarUrlConstants.avatarApi.getAvatarUrlV4,
    )}?${selectionTypesQuery}`;
    const config = { url, withCredentials: true, retryable: retry };

    return httpService
      .get<GetAvatarResponseV4>(config)
      .then((r: { data: GetAvatarResponseV4 }) =>
        AvatarAPIService.mapGetAvatarV4ToConfigV2(r.data),
      );
  }

  static mapGetAvatarV4ToConfigV2(response: GetAvatarResponseV4): AvatarConfigV2 {
    const { avatarModel, avatarConfigurations } = response;
    return {
      scales: avatarModel.scales,
      playerAvatarType: AvatarAPIService.mapPlayerAvatarType(avatarModel.playerAvatarType),
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
  }

  // Maps the V4 numeric `PlayerAvatarType` to the editor's "R6"/"R15" string. R15=3 is the
  // verified value; R6 is assumed 1 and 2 is also treated as R15 to cover the alternate
  // R6=1/R15=2 convention. Passes through a string in case the enum is serialized by name.
  private static mapPlayerAvatarType(value: number | string): string {
    if (typeof value === "string") {
      return value;
    }
    const byValue: Record<number, AvatarType> = { 1: "R6", 2: "R15", 3: "R15" };
    return byValue[value] ?? avatarConstants.avatarType.defaultOnPageLoad;
  }

  static getAvatarRules(): Promise<PlayerAvatarConfig> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getAvatarRulesUrl);
    const config = {
      url,
    };
    return httpService.get<PlayerAvatarConfig>(config).then(unwrapData);
  }

  static setScales(scales: any): Promise<SetBodyScalesResponse> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      return AvatarAPIService.updateAvatar<SetBodyScalesResponse>(
        AvatarAPIService.buildScalesUpdateRequest(scales as Partial<AvatarScales>),
      );
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.setScalesUrl);
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.post<SetBodyScalesResponse>(config, scales).then(unwrapData);
  }

  static setAvatarType(avatarType: AvatarType): Promise<SetAvatarTypeResponse> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      return AvatarAPIService.updateAvatar<SetAvatarTypeResponse>(
        AvatarAPIService.buildAvatarTypeUpdateRequest(avatarType),
      );
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.setAvatarTypeUrl);
    const config = {
      url,
      withCredentials: true,
    };
    const params = { playerAvatarType: avatarType };
    return httpService.post<SetAvatarTypeResponse>(config, params).then(unwrapData);
  }

  static getRecentItems(type: string): Promise<RecentItemsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getRecentItemsUrl, { type });
    const config = {
      url,
      withCredentials: true,
      retryable: true,
    };
    return httpService.get<RecentItemsResponse>(config).then(unwrapData);
  }

  static getAvatarInventory(
    sortOption: string | number,
    itemCategories: TAvatarInventoryItem[] | undefined,
    pageToken: string | undefined,
    availabilityStatus?: number,
  ): Promise<GetAvatarInventoryResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getAvatarInventoryUrl);
    const config = {
      url,
      withCredentials: true,
      retryable: true,
      transformResponse: preserveJsonNumberPrecision(["linkedEntityId"]),
    };
    const params: any = {
      sortOption,
      pageLimit: 50,
      pageToken,
      availabilityStatus,
    };
    if (itemCategories) {
      itemCategories.forEach((item, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        params[`itemCategories[${index}].ItemSubType`] = item.itemSubType;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        params[`itemCategories[${index}].ItemType`] = item.itemType;
      });
    }
    return httpService.get<GetAvatarInventoryResponse>(config, params).then(unwrapData);
  }

  static redrawThumbnail(): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.redrawThumbnailUrl);
    const config = {
      url,
      withCredentials: true,
      retryable: false,
    };
    return httpService.post<void>(config).then(unwrapData);
  }

  static getMetaData(retry = true): Promise<AvatarSettings> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getMetaData);
    const config = { url, withCredentials: true, retryable: retry };
    return httpService.get<AvatarSettings>(config, config).then(unwrapData);
  }

  static getCatalogMetaData(retry = true): Promise<CatalogSettings> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getMetaData);
    const config = {
      url,
      withCredentials: true,
      retryable: retry,
    };
    return httpService.get<CatalogSettings>(config).then(unwrapData);
  }

  static getCategories(): Promise<unknown> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getCategories);
    const config = {
      url,
    };
    return httpService.get<any>(config).then(unwrapData);
  }

  static getSubcategories(): Promise<unknown> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getSubcategories);
    const config = {
      url,
    };
    return httpService.get<any>(config).then(unwrapData);
  }

  static postItemDetails(
    items: { assetId: number }[],
    itemType: string,
  ): Promise<PostItemDetailsResponse> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.postItemDetails);
    const config = {
      url,
      withCredentials: true,
    };
    const params = {
      items: items.map(item => ({ itemType, id: item.assetId })),
    };
    return httpService.post<PostItemDetailsResponse>(config, params).then(unwrapData);
  }

  static getEmotes(): Promise<GetEmotesResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getEmotesUrl);
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.get<GetEmotesResponse>(config).then(unwrapData);
  }

  /**
   * Equips `assetId` at `positionIndex`.
   *
   * The V4 endpoint replaces the entire emote config with the array it receives, so
   * `currentEmotes` (the emotes already equipped in the other slots) must be included
   * alongside the changed slot. The legacy endpoint ignores `currentEmotes`.
   */
  static equipEmote(
    assetId: number,
    positionIndex: number,
    currentEmotes: EmoteRequestModel[] = [],
  ): Promise<void> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      const emotes = currentEmotes.filter(emote => emote.position !== positionIndex);
      emotes.push({ assetId, position: positionIndex });
      return AvatarAPIService.updateAvatar<void>(AvatarAPIService.buildEmotesUpdateRequest(emotes));
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.equipEmoteUrl, {
      assetId,
      position: positionIndex,
    });
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.post<void>(config).then(unwrapData);
  }

  /**
   * Unequips the emote at `positionIndex`.
   *
   * The V4 endpoint replaces the entire emote config, so we send `currentEmotes` with the
   * cleared slot removed. The legacy endpoint ignores `currentEmotes`.
   */
  static unequipEmote(
    positionIndex: number,
    currentEmotes: EmoteRequestModel[] = [],
  ): Promise<void> {
    if (AvatarAPIService.isUpdateAvatarV4Enabled) {
      const emotes = currentEmotes.filter(emote => emote.position !== positionIndex);
      return AvatarAPIService.updateAvatar<void>(AvatarAPIService.buildEmotesUpdateRequest(emotes));
    }

    const url = this.avatarApi(avatarUrlConstants.avatarApi.unequipEmoteUrl, {
      position: positionIndex,
    });
    const config = {
      url,
      withCredentials: true,
    };
    return httpService.delete<void>(config).then(unwrapData);
  }

  /**
   * Sets (or clears, with `backgroundAssetId = 0`) the avatar profile background via the
   * consolidated V4 endpoint. Backgrounds have no legacy equip endpoint, so this is V4-only.
   */
  static equipBackground(backgroundAssetId: number): Promise<UpdateAvatarResponseV4> {
    return AvatarAPIService.updateAvatar(
      AvatarAPIService.buildBackgroundUpdateRequest(backgroundAssetId),
    );
  }

  static getInventoryUrl(userId: string): string {
    return this.inventoryApi(avatarUrlConstants.inventoryApi.getInventory, { userId });
  }

  static getInventoryItems(params: any): Promise<GetInventoryItemsResponse> {
    const url = this.getInventoryUrl(getCurrentUserId());

    const config = {
      url,
      withCredentials: true,
    };
    return httpService.get<GetInventoryItemsResponse>(config, params).then(unwrapData);
  }

  // static getInventoryItems(): Promise<InventoryAsset[]> {
  //   const url = this.avatarApi(avatarUrlConstants.avatarApi.getEmotesUrl);
  //   const config = {
  //     url
  //   };
  //   return httpService.get<InventoryAsset[]>(config).then(unwrapData);
  // }

  static getOwnership(userId: string, itemType: string, itemId: number): Promise<boolean> {
    const mappedItemType =
      itemType.toLowerCase() === "asset"
        ? avatarConstants.itemTypeIds.asset
        : avatarConstants.itemTypeIds.bundle;

    const url = this.inventoryApi(avatarUrlConstants.inventoryApi.getIsOwned, {
      userId,
      itemType: mappedItemType,
      itemId,
    });
    const config = {
      url,
    };
    return httpService.get<any>(config).then(unwrapData);
  }

  static getAppPolicyBehavior(): Promise<AvatarAppPolicy> {
    return callBehaviour<AvatarAppPolicy>(avatarUrlConstants.policyEndpoints.appPolicyName);
  }

  static getUserCurrency(userId: string): Promise<GetUserCurrencyResponse> {
    const url = this.economyApi(avatarUrlConstants.economyApi.getUserCurrency, { userId });
    const config = { url, withCredentials: true };
    return httpService.get<GetUserCurrencyResponse>(config).then(unwrapData);
  }

  static getFeatureAccess(): Promise<GetFeatureAccessResponse> {
    const url = this.api(avatarUrlConstants.api.featureAccess);
    const config = { url, withCredentials: true };
    return httpService.get<GetFeatureAccessResponse>(config).then(unwrapData);
  }
}

// Factory: NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js (set to "true"
// in apps/www .env). In the Rspack SCS build for .NET it is undefined, so the
// legacy Axios path is used. In Next.js, @rbx/www-nextjs instrumentation-client.ts
// has already called setClientInterceptors() from @rbx/www-common/http before any
// component code runs, so core-lib/http calls get CSRF, locale, and Sentry for free.
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? AvatarAPIServiceNextJs : AvatarAPIService;
