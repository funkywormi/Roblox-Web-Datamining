/**
 * Next.js implementation of the avatar service using @rbx/core-lib/http.
 *
 * Error handling:
 *   getOrThrow() on AsyncResult converts to Promise<T>, rejecting on HttpError.
 *   Callers that inspect error.response.status still work (HttpError has .response.status).
 *   Callers that inspect error.response.data (Axios-specific) will need updating
 *   separately — tracked in avatarEditingError.utils.ts.
 */

import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import environmentUrls from "@rbx/environment-urls";
import { getCurrentUserId } from "../utils/currentUser";
import {
  TSetBodyColors,
  AvatarType,
  TPatchOutfitResponse,
  TAvatarInventoryItem,
} from "../constants/types";
import avatarUrlConstants from "../constants/avatarUrlConstants";
import avatarConstants from "../constants/avatarConstants";
import { PlayerAvatarConfig } from "../avatarRules";
import { AvatarConfigV2, AvatarScales } from "../avatarRequest";
import { CatalogSettings } from "../catalogMetadataRequest";
import { AvatarSettings } from "../metadataRequest";
import { OutfitDetailsV3 } from "../types";
import {
  AvatarUpdateType,
  GetAvatarResponseV4,
  UpdateAvatarResponseV4,
} from "../types/updateAvatarV4.types";
import { BodyColorsStateV2, BodyColorsV2Request } from "../types/bodyColors.types";
import {
  GetOutfitDefinitionResponseV4,
  MutateOutfitDefinitionResponseV4,
} from "../types/outfitV4.types";
import { AvatarAppPolicy } from "../avatarAppPolicy";
import {
  SetBodyColorsResponse,
  SetBodyScalesResponse,
  SetAvatarTypeResponse,
  SetWearingAssetsResponse,
  GetAvatarInventoryResponse,
  GetEmotesResponse,
  GetUserCurrencyResponse,
  GetFeatureAccessResponse,
  PostItemDetailsResponse,
  GetInventoryItemsResponse,
} from "./avatarAPIService";
import {
  buildCreateOutfitRequestV4,
  buildPatchOutfitRequestV4,
  mapGetOutfitDefinitionV4ToV3,
  mapPatchOutfitResponseV4,
} from "./outfitV4";
import { getAvatarV4SearchParams, mapGetAvatarV4ToConfigV2 } from "./avatarV4";

// Substitute `{param}` placeholders. The Next.js endpoints shim's generateAbsoluteUrl
// does not expand path params, so we do it locally here.
const fillPathParams = (path: string, pathParams: Record<string, unknown> = {}): string => {
  let result = path;
  Object.entries(pathParams).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}(:.*?)?\\??\\}`, "i"), String(value));
  });
  return result;
};

const buildUrl = (base: string, path: string, pathParams: Record<string, unknown> = {}): Url => {
  return Url.parse(`${base}${fillPathParams(path, pathParams)}`).getOrThrow();
};

// Trim any trailing slash: the Next.js `@rbx/environment-urls` shim returns hosts via
// `Url.toString()` (e.g. "https://avatar.roblox.com/"), so concatenating with a
// leading-slash path would produce a double slash. No-op on .NET (the real
// EnvironmentUrls hosts have no trailing slash).
const trimTrailingSlash = (host: string): string => host.replace(/\/$/, "");
const avatarBase = () => trimTrailingSlash(environmentUrls.avatarApi);
const catalogBase = () => trimTrailingSlash(environmentUrls.catalogApi);
const inventoryBase = () => trimTrailingSlash(environmentUrls.inventoryApi);
const economyBase = () => trimTrailingSlash(environmentUrls.economyApi);
const apiBase = () => trimTrailingSlash(environmentUrls.apiGatewayUrl);

const GET = { credentials: "include" as const };
const POST = { credentials: "include" as const };

// http has no patch helper — use fetch directly with PATCH method
const patch = async (url: Url, body: unknown): Promise<unknown> => {
  const result = await http.fetch(url, {
    ...POST,
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
  if (!result.isOk()) throw result.error;
  return result.value.json();
};

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class AvatarAPIServiceNextJs {
  // When true, the avatar read uses `GET /v4/avatar`, which also returns the equipped background.
  private static isGetAvatarV4Enabled = false;

  // When true, outfit create/update/details route through the `/v4/outfits/*` endpoints, which
  // carry the outfit definition and persist the profile background. Matches AvatarAPIService.
  private static isOutfitApiV4Enabled = false;

  // Set by useLoadAvatarPage before the first request. The avatar write V4 flag isn't used on
  // Next.js yet; those calls still use the legacy endpoints.
  static configure(
    settings: Pick<
      AvatarSettings,
      "isUpdateAvatarV4Enabled" | "isGetAvatarV4Enabled" | "isOutfitApiV4Enabled"
    >,
  ): void {
    AvatarAPIServiceNextJs.isGetAvatarV4Enabled = settings.isGetAvatarV4Enabled;
    AvatarAPIServiceNextJs.isOutfitApiV4Enabled = settings.isOutfitApiV4Enabled;
  }

  static getAvatarV2(): Promise<AvatarConfigV2> {
    if (AvatarAPIServiceNextJs.isGetAvatarV4Enabled) {
      return AvatarAPIServiceNextJs.getAvatarV4();
    }

    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getAvatarUrlV2);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<AvatarConfigV2>;
  }

  /** `GET /v4/avatar`, mapped back to `AvatarConfigV2`. */
  static async getAvatarV4(): Promise<AvatarConfigV2> {
    const url = Url.parse(
      `${avatarBase()}${avatarUrlConstants.avatarApi.getAvatarUrlV4}?${getAvatarV4SearchParams()}`,
    ).getOrThrow();
    const response = (await http
      .getUntyped(url, GET)
      .getOrThrow()) as unknown as GetAvatarResponseV4;
    return mapGetAvatarV4ToConfigV2(response);
  }

  static getAvatarRules(): Promise<PlayerAvatarConfig> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getAvatarRulesUrl);
    return http.getUntyped(url).getOrThrow() as unknown as Promise<PlayerAvatarConfig>;
  }

  static getMetaData(): Promise<AvatarSettings> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getMetaData);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<AvatarSettings>;
  }

  static getCatalogMetaData(): Promise<CatalogSettings> {
    const url = buildUrl(catalogBase(), avatarUrlConstants.catalogApi.getMetaData);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<CatalogSettings>;
  }

  static getCategories(): Promise<unknown> {
    const url = buildUrl(catalogBase(), avatarUrlConstants.catalogApi.getCategories);
    return http.getUntyped(url).getOrThrow();
  }

  static getSubcategories(): Promise<unknown> {
    const url = buildUrl(catalogBase(), avatarUrlConstants.catalogApi.getSubcategories);
    return http.getUntyped(url).getOrThrow();
  }

  static getOutfitDetailsV3(userOutfitId: number): Promise<OutfitDetailsV3> {
    if (AvatarAPIServiceNextJs.isOutfitApiV4Enabled) {
      return AvatarAPIServiceNextJs.getOutfitDetailsV4(userOutfitId);
    }

    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getOutfitDetailsUrlV3, {
      id: userOutfitId,
    });
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<OutfitDetailsV3>;
  }

  /** `GET /v4/outfits/{id}/details`, mapped back to `OutfitDetailsV3`. */
  static async getOutfitDetailsV4(userOutfitId: number): Promise<OutfitDetailsV3> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getOutfitDetailsUrlV4, {
      id: userOutfitId,
    });
    const response = (await http
      .getUntyped(url, GET)
      .getOrThrow()) as unknown as GetOutfitDefinitionResponseV4;
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
    if (AvatarAPIServiceNextJs.isOutfitApiV4Enabled) {
      // Callers of createOutfitV3 don't read the body, so drop it to keep the void contract.
      return AvatarAPIServiceNextJs.createOutfitV4(
        name,
        bodyColor3s,
        assets,
        scale,
        playerAvatarType,
        backgroundAssetId,
      ).then(() => undefined);
    }

    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.createOutfitUrlV3);
    // Only send backgroundAssetId when known so we never overwrite a saved background with `undefined`.
    const params = {
      name,
      bodyColor3s,
      assets,
      scale,
      playerAvatarType,
      ...(backgroundAssetId !== undefined && { backgroundAssetId }),
    };
    return http.postUntyped(url, params, POST).getOrThrow() as unknown as Promise<void>;
  }

  /** `POST /v4/outfits/create`. See `buildCreateOutfitRequestV4`. */
  static createOutfitV4(
    name: string,
    bodyColor3s: BodyColorsV2Request | BodyColorsStateV2,
    assets: AccoutrementAsset[],
    scale: AvatarScales,
    playerAvatarType: string,
    backgroundAssetId?: number,
  ): Promise<MutateOutfitDefinitionResponseV4> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.createOutfitUrlV4);
    const body = buildCreateOutfitRequestV4(
      name,
      bodyColor3s,
      assets,
      scale,
      playerAvatarType,
      backgroundAssetId,
    );
    return http
      .postUntyped(url, body, POST)
      .getOrThrow() as unknown as Promise<MutateOutfitDefinitionResponseV4>;
  }

  static async patchOutfitV3(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    if (AvatarAPIServiceNextJs.isOutfitApiV4Enabled) {
      return AvatarAPIServiceNextJs.patchOutfitV4(userOutfitId, outfitContents);
    }

    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.patchOutfitUrlV3, {
      id: userOutfitId,
    });
    return (await patch(url, outfitContents)) as TPatchOutfitResponse;
  }

  /** `PATCH /v4/outfits/{id}`. See `buildPatchOutfitRequestV4`. */
  static async patchOutfitV4(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.patchOutfitUrlV4, {
      id: userOutfitId,
    });
    const response = (await patch(url, buildPatchOutfitRequestV4(outfitContents))) as
      | MutateOutfitDefinitionResponseV4
      | undefined;
    return mapPatchOutfitResponseV4(response, userOutfitId, outfitContents);
  }

  static deleteOutfit(userOutfitId: number): Promise<void> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.deleteOutfitUrl, {
      id: userOutfitId,
    });
    return http.postUntyped(url, {}, POST).getOrThrow() as unknown as Promise<void>;
  }

  static setBodyColors(bodyColors: TSetBodyColors): Promise<SetBodyColorsResponse> {
    const hasColorId =
      "headColorId" in bodyColors &&
      typeof (bodyColors as BodyColorsStateV2).headColorId === "string";
    const hasColor3 = "headColor3" in bodyColors;

    if (hasColorId) return this.setBodyColorsV2(bodyColors as BodyColorsStateV2);

    if (hasColor3) {
      const b = bodyColors as {
        headColor3: string;
        torsoColor3: string;
        rightArmColor3: string;
        leftArmColor3: string;
        rightLegColor3: string;
        leftLegColor3: string;
      };
      return this.setBodyColorsV2({
        headColorId: b.headColor3,
        torsoColorId: b.torsoColor3,
        rightArmColorId: b.rightArmColor3,
        leftArmColorId: b.leftArmColor3,
        rightLegColorId: b.rightLegColor3,
        leftLegColorId: b.leftLegColor3,
      });
    }

    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.setBodyColorsUrl);
    return http
      .postUntyped(url, bodyColors, POST)
      .getOrThrow() as unknown as Promise<SetBodyColorsResponse>;
  }

  static setBodyColorsV2(bodyColors: BodyColorsStateV2): Promise<SetBodyColorsResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.setBodyColorsUrlV2);
    const requestBody: BodyColorsV2Request = {
      headColor3: bodyColors.headColorId,
      torsoColor3: bodyColors.torsoColorId,
      rightArmColor3: bodyColors.rightArmColorId,
      leftArmColor3: bodyColors.leftArmColorId,
      rightLegColor3: bodyColors.rightLegColorId,
      leftLegColor3: bodyColors.leftLegColorId,
    };
    return http
      .postUntyped(url, requestBody, POST)
      .getOrThrow() as unknown as Promise<SetBodyColorsResponse>;
  }

  static setWearingAssetsV2(assets: AccoutrementAsset[]): Promise<SetWearingAssetsResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.setWearingAssetsUrlV2);
    return http
      .postUntyped(url, { assets }, POST)
      .getOrThrow() as unknown as Promise<SetWearingAssetsResponse>;
  }

  static wearAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.wearAssetUrl, { id: assetId });
    return http
      .postUntyped(url, {}, POST)
      .getOrThrow() as unknown as Promise<SetWearingAssetsResponse>;
  }

  static removeAsset(assetId: number): Promise<SetWearingAssetsResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.removeAssetUrl, {
      id: assetId,
    });
    return http
      .postUntyped(url, {}, POST)
      .getOrThrow() as unknown as Promise<SetWearingAssetsResponse>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setScales(scales: any): Promise<SetBodyScalesResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.setScalesUrl);
    return http
      .postUntyped(url, scales, POST)
      .getOrThrow() as unknown as Promise<SetBodyScalesResponse>;
  }

  static setAvatarType(avatarType: AvatarType): Promise<SetAvatarTypeResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.setAvatarTypeUrl);
    return http
      .postUntyped(url, { playerAvatarType: avatarType }, POST)
      .getOrThrow() as unknown as Promise<SetAvatarTypeResponse>;
  }

  static getEmotes(): Promise<GetEmotesResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getEmotesUrl);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<GetEmotesResponse>;
  }

  static postItemDetails(
    items: { assetId: number }[],
    itemType: string,
  ): Promise<PostItemDetailsResponse> {
    const url = buildUrl(catalogBase(), avatarUrlConstants.catalogApi.postItemDetails);
    return http
      .postUntyped(url, { items: items.map(item => ({ itemType, id: item.assetId })) }, POST)
      .getOrThrow() as unknown as Promise<PostItemDetailsResponse>;
  }

  static getAvatarInventory(
    sortOption: string | number,
    itemCategories: TAvatarInventoryItem[] | undefined,
    pageToken: string | undefined,
    availabilityStatus?: number,
  ): Promise<GetAvatarInventoryResponse> {
    const params: Record<string, unknown> = {
      sortOption,
      pageLimit: 50,
      pageToken,
      availabilityStatus,
    };
    if (itemCategories) {
      itemCategories.forEach((item, index) => {
        params[`itemCategories[${index}].ItemSubType`] = item.itemSubType;
        params[`itemCategories[${index}].ItemType`] = item.itemType;
      });
    }
    // preserveJsonNumberPrecision is Axios-specific (transformResponse). The linkedEntityId
    // precision issue should be addressed with a Zod bigint/string schema in a follow-on.
    const url = buildUrl(
      avatarBase(),
      avatarUrlConstants.avatarApi.getAvatarInventoryUrl,
    ).withSearchParams(
      Object.fromEntries(
        Object.entries(params)
          .filter(([, v]) => v != null)
          .map(([k, v]) => [k, String(v)]),
      ),
    );
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<GetAvatarInventoryResponse>;
  }

  static getUserCurrency(userId: string): Promise<GetUserCurrencyResponse> {
    const url = buildUrl(economyBase(), avatarUrlConstants.economyApi.getUserCurrency, { userId });
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<GetUserCurrencyResponse>;
  }

  static getFeatureAccess(): Promise<GetFeatureAccessResponse> {
    const url = buildUrl(apiBase(), avatarUrlConstants.api.featureAccess);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<GetFeatureAccessResponse>;
  }

  static getOwnership(userId: string, itemType: string, itemId: number): Promise<boolean> {
    const mappedItemType =
      itemType.toLowerCase() === "asset"
        ? avatarConstants.itemTypeIds.asset
        : avatarConstants.itemTypeIds.bundle;
    const url = buildUrl(inventoryBase(), avatarUrlConstants.inventoryApi.getIsOwned, {
      userId,
      itemType: mappedItemType,
      itemId,
    });
    return http.getUntyped(url).getOrThrow() as unknown as Promise<boolean>;
  }

  static equipEmote(assetId: number, positionIndex: number): Promise<void> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.equipEmoteUrl, {
      assetId,
      position: positionIndex,
    });
    return http.postUntyped(url, {}, POST).getOrThrow() as unknown as Promise<void>;
  }

  static async unequipEmote(positionIndex: number): Promise<void> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.unequipEmoteUrl, {
      position: positionIndex,
    });
    const result = await http.fetch(url, { ...POST, method: "DELETE" });
    if (!result.isOk()) throw result.error;
  }

  static redrawThumbnail(): Promise<void> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.redrawThumbnailUrl);
    return http.postUntyped(url, {}, POST).getOrThrow() as unknown as Promise<void>;
  }

  // V4-only — no legacy equip endpoint for backgrounds.
  static async equipBackground(backgroundAssetId: number): Promise<UpdateAvatarResponseV4> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.updateAvatarUrlV4);
    // Same shape as AvatarAPIService.buildBackgroundUpdateRequest.
    const body = {
      updateTypes: [AvatarUpdateType.UpdateBackground],
      avatarDefinition: {
        updateAvatarConfig: { backgroundRequestModel: { id: backgroundAssetId } },
      },
    };
    const result = await http.fetch(url, {
      ...POST,
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });
    if (!result.isOk()) throw result.error;
    return result.value.json() as Promise<UpdateAvatarResponseV4>;
  }

  // Guac endpoint: /guac-v2/v1/bundles/app-policy
  // Intentionally uses http.getUntyped instead of callBehaviour — this is the Next.js
  // implementation that uses @rbx/core-lib/http (fetch) rather than the Axios-based callBehaviour.
  static getAppPolicyBehavior(): Promise<AvatarAppPolicy> {
    // eslint-disable-next-line no-restricted-syntax
    const guacPath = `/guac-v2/v1/bundles/${avatarUrlConstants.policyEndpoints.appPolicyName}`;
    const url = buildUrl(apiBase(), guacPath);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<AvatarAppPolicy>;
  }

  static getInventoryItems(params: Record<string, unknown>): Promise<GetInventoryItemsResponse> {
    const inventoryUrl = `${inventoryBase()}${fillPathParams(
      avatarUrlConstants.inventoryApi.getInventory,
      { userId: getCurrentUserId() },
    )}`;
    const url = Url.parse(inventoryUrl)
      .getOrThrow()
      .withSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)]),
        ),
      );
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<GetInventoryItemsResponse>;
  }
}

export default AvatarAPIServiceNextJs;
