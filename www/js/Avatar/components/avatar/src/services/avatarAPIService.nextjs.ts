/**
 * Next.js implementation of the avatar service using @rbx/core-lib/http.
 *
 * Why no manual CSRF/auth wiring here:
 *   @rbx/www-nextjs instrumentation-client.ts calls setClientInterceptors() from
 *   @rbx/www-common/http before any component code runs. That interceptor handles
 *   CSRF tokens, locale headers, and Sentry tracing automatically for every
 *   http.get / http.post call below. Nothing extra needed in the service itself.
 *
 * Error handling:
 *   getOrThrow() on AsyncResult converts to Promise<T>, rejecting on HttpError.
 *   Callers that inspect error.response.status still work (HttpError has .response.status).
 *   Callers that inspect error.response.data (Axios-specific) will need updating
 *   separately — tracked in avatarEditingError.utils.ts.
 */

import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import type { JsonSerializable } from "@rbx/core-lib/json";
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
import { AvatarUpdateType, UpdateAvatarResponseV4 } from "../types/updateAvatarV4.types";
import { BodyColorsStateV2, BodyColorsV2Request } from "../types/bodyColors.types";
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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class AvatarAPIServiceNextJs {
  // V4 feature flags are set by useLoadAvatarPage after fetching metadata.
  // Not yet used in the Next.js implementation — routing will be added when the
  // relevant endpoints are migrated. Method must exist for type compatibility.
  static configure(
    _settings: Pick<
      AvatarSettings,
      "isUpdateAvatarV4Enabled" | "isGetAvatarV4Enabled" | "isOutfitApiV4Enabled"
    >,
  ): void {
    // V4 feature flags not yet used in the Next.js path; routing added per-method as needed.
  }

  static getAvatarV2(): Promise<AvatarConfigV2> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getAvatarUrlV2);
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<AvatarConfigV2>;
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
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.getOutfitDetailsUrlV3, {
      id: userOutfitId,
    });
    return http.getUntyped(url, GET).getOrThrow() as unknown as Promise<OutfitDetailsV3>;
  }

  static createOutfitV3(
    name: string,
    bodyColor3s: BodyColorsV2Request | BodyColorsStateV2,
    assets: AccoutrementAsset[],
    scale: AvatarScales,
    playerAvatarType: string,
  ): Promise<void> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.createOutfitUrlV3);
    return http
      .postUntyped(url, { name, bodyColor3s, assets, scale, playerAvatarType }, POST)
      .getOrThrow() as unknown as Promise<void>;
  }

  static async patchOutfitV3(
    userOutfitId: number,
    outfitContents: Partial<OutfitDetailsV3>,
  ): Promise<TPatchOutfitResponse> {
    const url = buildUrl(avatarBase(), avatarUrlConstants.avatarApi.patchOutfitUrlV3, {
      id: userOutfitId,
    });
    // http has no patch helper — use fetch directly with PATCH method
    const result = await http.fetch(url, {
      ...POST,
      method: "PATCH",
      body: JSON.stringify(outfitContents),
      headers: { "content-type": "application/json" },
    });
    if (!result.isOk()) throw result.error;
    return result.value.json() as Promise<TPatchOutfitResponse>;
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
    const body = {
      updateTypes: [AvatarUpdateType.UpdateBackground],
      updateAvatarConfig: { backgroundRequestModel: { id: backgroundAssetId } },
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
