import { AxiosError, get, patch, post } from "@rbx/core-scripts/http";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { callBehaviour } from "@rbx/core-scripts/guac";
import { generateAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import environmentUrls from "@rbx/environment-urls";
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
import { AvatarConfigV2, AvatarScales } from "../avatarRequest";
import { CatalogSettings } from "../catalogMetadataRequest";
import { AvatarAppPolicy } from "../avatarAppPolicy";
import { AvatarSettings } from "../metadataRequest";
import { AvatarItemAvailabilityStatus, ItemLicense } from "../avatar.types";
import { OutfitDetailsV3 } from "../types";
import { BodyColorsStateV2, BodyColorsV2Request } from "../types/bodyColors.types";
import {
  EmoteRequestModel,
  UpdateAvatarRequestV4,
  UpdateAvatarResponseV4,
  GetAvatarResponseV4,
  AvatarValidationResultV4,
  InvalidAssetV4,
} from "../types/updateAvatarV4.types";
import {
  MutateOutfitDefinitionResponseV4,
  GetOutfitDefinitionResponseV4,
} from "../types/outfitV4.types";
import { preserveJsonNumberPrecision } from "../utils/preserveJsonNumberPrecision";
import AvatarAPIServiceNextJs from "./avatarAPIService.nextjs";
import {
  buildCreateOutfitRequestV4,
  buildPatchOutfitRequestV4,
  mapGetOutfitDefinitionV4ToV3,
  mapPatchOutfitResponseV4,
} from "./outfitV4";
import { getAvatarV4SearchParams, mapGetAvatarV4ToConfigV2 } from "./avatarV4";
import { buildAvatarUpdateRequest, emotesAfterEquip, emotesAfterUnequip } from "./updateAvatarV4";

// Unwraps the Axios response body.
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
  timeoutActions?: TimeoutAction[];
};

export type TimeoutAction = {
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
  isPlusExclusive?: boolean;
  license?: ItemLicense;
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

// Named export alongside the default: the default is a build-time union of this and the
// Next.js implementation, so it cannot type-check calls to members only one of them has.
// TODO: old, migrated code
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AvatarAPIService {
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

  static getOutfitDetailsV3(userOutfitId: number): Promise<OutfitDetailsV3> {
    return AvatarAPIService.getOutfitDetailsV4(userOutfitId);
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
    return get<GetOutfitDefinitionResponseV4>(config).then(
      (r: { data: GetOutfitDefinitionResponseV4 }) =>
        AvatarAPIService.mapGetOutfitDefinitionV4ToV3(r.data),
    );
  }

  static mapGetOutfitDefinitionV4ToV3(response: GetOutfitDefinitionResponseV4): OutfitDetailsV3 {
    return mapGetOutfitDefinitionV4ToV3(response);
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
    const body = buildCreateOutfitRequestV4(
      name,
      bodyColor3s,
      assets,
      scale,
      playerAvatarType,
      backgroundAssetId,
    );
    return post<MutateOutfitDefinitionResponseV4>({ url, withCredentials: true }, body).then(
      unwrapData,
    );
  }

  static patchOutfitV3(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    return AvatarAPIService.patchOutfitV4(userOutfitId, outfitContents);
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
    return patch<MutateOutfitDefinitionResponseV4>(
      { url, withCredentials: true },
      buildPatchOutfitRequestV4(outfitContents),
    ).then((r: { data: MutateOutfitDefinitionResponseV4 }) =>
      mapPatchOutfitResponseV4(r.data, userOutfitId, outfitContents),
    );
  }

  static deleteOutfit(userOutfitId: number): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.deleteOutfitUrl, { id: userOutfitId });
    return post<void>({ url, withCredentials: true }).then(unwrapData);
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
    return patch<T>(config, request).then(unwrapData);
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

    return post<SetBodyColorsResponse>(config, bodyColors).then(unwrapData);
  }

  static setBodyColorsV2(bodyColors: BodyColorsStateV2): Promise<SetBodyColorsResponse> {
    return AvatarAPIService.updateAvatar<SetBodyColorsResponse>(
      buildAvatarUpdateRequest({ bodyColors }),
    );
  }

  static setWearingAssetsV2(assets: AccoutrementAsset[]): Promise<SetWearingAssetsResponse> {
    return AvatarAPIService.updateAvatar<SetWearingAssetsResponse>(
      buildAvatarUpdateRequest({ assets }),
    );
  }

  static wearAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.wearAssetUrl, { id: assetId });

    const config = {
      url,
      withCredentials: true,
    };

    return post<SetWearingAssetsResponse>(config).then(unwrapData);
  }

  static removeAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.removeAssetUrl, { id: assetId });

    const config = {
      url,
      withCredentials: true,
    };

    return post<SetWearingAssetsResponse>(config).then(unwrapData);
  }

  static getAvatarV2(retry = true): Promise<AvatarConfigV2> {
    return AvatarAPIService.getAvatarV4(retry);
  }

  static getAvatarV4(retry = true): Promise<AvatarConfigV2> {
    const url = `${this.avatarApi(
      avatarUrlConstants.avatarApi.getAvatarUrlV4,
    )}?${getAvatarV4SearchParams()}`;
    const config = { url, withCredentials: true, retryable: retry };

    return get<GetAvatarResponseV4>(config).then((r: { data: GetAvatarResponseV4 }) =>
      mapGetAvatarV4ToConfigV2(r.data),
    );
  }

  static getAvatarRules(): Promise<PlayerAvatarConfig> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getAvatarRulesUrl);
    const config = {
      url,
    };
    return get<PlayerAvatarConfig>(config).then(unwrapData);
  }

  static setScales(scales: any): Promise<SetBodyScalesResponse> {
    return AvatarAPIService.updateAvatar<SetBodyScalesResponse>(
      buildAvatarUpdateRequest({ scales: scales as Partial<AvatarScales> }),
    );
  }

  static setAvatarType(avatarType: AvatarType): Promise<SetAvatarTypeResponse> {
    return AvatarAPIService.updateAvatar<SetAvatarTypeResponse>(
      buildAvatarUpdateRequest({ avatarType }),
    );
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
    return get<GetAvatarInventoryResponse>(config, params).then(unwrapData);
  }

  static redrawThumbnail(): Promise<void> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.redrawThumbnailUrl);
    const config = {
      url,
      withCredentials: true,
      retryable: false,
    };
    return post<void>(config).then(unwrapData);
  }

  static getMetaData(retry = true): Promise<AvatarSettings> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getMetaData);
    const config = { url, withCredentials: true, retryable: retry };
    return get<AvatarSettings>(config, config).then(unwrapData);
  }

  static getCatalogMetaData(retry = true): Promise<CatalogSettings> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getMetaData);
    const config = {
      url,
      withCredentials: true,
      retryable: retry,
    };
    return get<CatalogSettings>(config).then(unwrapData);
  }

  static getCategories(): Promise<unknown> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getCategories);
    const config = {
      url,
    };
    return get<any>(config).then(unwrapData);
  }

  static getSubcategories(): Promise<unknown> {
    const url = this.catalogApi(avatarUrlConstants.catalogApi.getSubcategories);
    const config = {
      url,
    };
    return get<any>(config).then(unwrapData);
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
    return post<PostItemDetailsResponse>(config, params).then(unwrapData);
  }

  static getEmotes(): Promise<GetEmotesResponse> {
    const url = this.avatarApi(avatarUrlConstants.avatarApi.getEmotesUrl);
    const config = {
      url,
      withCredentials: true,
    };
    return get<GetEmotesResponse>(config).then(unwrapData);
  }

  /**
   * Equips `assetId` at `positionIndex`.
   *
   * The V4 endpoint replaces the entire emote config with the array it receives, so
   * `currentEmotes` (the emotes already equipped in the other slots) must be included
   * alongside the changed slot.
   */
  static equipEmote(
    assetId: number,
    positionIndex: number,
    currentEmotes: EmoteRequestModel[],
  ): Promise<void> {
    return AvatarAPIService.updateAvatar<void>(
      buildAvatarUpdateRequest({
        emotes: emotesAfterEquip(currentEmotes, assetId, positionIndex),
      }),
    );
  }

  /**
   * Unequips the emote at `positionIndex`.
   *
   * The V4 endpoint replaces the entire emote config, so we send `currentEmotes` with the
   * cleared slot removed.
   */
  static unequipEmote(positionIndex: number, currentEmotes: EmoteRequestModel[]): Promise<void> {
    return AvatarAPIService.updateAvatar<void>(
      buildAvatarUpdateRequest({ emotes: emotesAfterUnequip(currentEmotes, positionIndex) }),
    );
  }

  /**
   * Sets (or clears, with `backgroundAssetId = 0`) the avatar profile background via the
   * consolidated V4 endpoint. Backgrounds have no legacy equip endpoint, so this is V4-only.
   */
  static equipBackground(backgroundAssetId: number): Promise<UpdateAvatarResponseV4> {
    return AvatarAPIService.updateAvatar(buildAvatarUpdateRequest({ backgroundAssetId }));
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
    return get<GetInventoryItemsResponse>(config, params).then(unwrapData);
  }

  // static getInventoryItems(): Promise<InventoryAsset[]> {
  //   const url = this.avatarApi(avatarUrlConstants.avatarApi.getEmotesUrl);
  //   const config = {
  //     url
  //   };
  //   return get<InventoryAsset[]>(config).then(unwrapData);
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
    return get<any>(config).then(unwrapData);
  }

  static getAppPolicyBehavior(): Promise<AvatarAppPolicy> {
    return callBehaviour<AvatarAppPolicy>(avatarUrlConstants.policyEndpoints.appPolicyName);
  }

  static getUserCurrency(userId: string): Promise<GetUserCurrencyResponse> {
    const url = this.economyApi(avatarUrlConstants.economyApi.getUserCurrency, { userId });
    const config = { url, withCredentials: true };
    return get<GetUserCurrencyResponse>(config).then(unwrapData);
  }

  static getFeatureAccess(): Promise<GetFeatureAccessResponse> {
    const url = this.api(avatarUrlConstants.api.featureAccess);
    const config = { url, withCredentials: true };
    return get<GetFeatureAccessResponse>(config).then(unwrapData);
  }
}

const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export default isNextJs ? AvatarAPIServiceNextJs : AvatarAPIService;
