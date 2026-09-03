import { AxiosResponse } from "@rbx/core-scripts/http";
import * as http from "@rbx/core-scripts/http";
import { dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { callBehaviour } from "@rbx/core-scripts/guac";
import environmentUrls from "@rbx/environment-urls";
import {
  TGetProductInfo,
  TGetPlayabilityStatus,
  TGetProductDetails,
  TShowAgeVerificationOverlayResponse,
  TGuacPlayButtonUIResponse,
  TPostOptUserInToVoiceChatResponse,
  TGetUserSettingsAndOptionsResponse,
  TAgeGuidelinesResponse,
  TFiatPreparePurchaseResponse,
  TFiatPreparePurchaseCheckoutUrl,
} from "../types/playButtonTypes";

const { gamesDataStore } = dataStores;

const getProductDetails = async (placeId: string[]): Promise<TGetProductDetails | undefined> => {
  // @ts-expect-error TODO: old, migrated code.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { data = [] } = (await gamesDataStore.getPlaceDetails(placeId)) as AxiosResponse<
    TGetProductDetails[]
  >;
  return data[0];
};

const getProductInfo = async (universeIds: string[]): Promise<TGetProductInfo | undefined> => {
  const {
    data: { data = [] },
    // @ts-expect-error TODO: old, migrated code.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  } = (await gamesDataStore.getProductInfo(universeIds)) as AxiosResponse<{
    data: TGetProductInfo[];
  }>;
  return data[0];
};

const getPlayabilityStatus = async (
  universeIds: string[],
): Promise<TGetPlayabilityStatus | undefined> => {
  // @ts-expect-error TODO: old, migrated code.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { data = [] } = (await gamesDataStore.getPlayabilityStatus(universeIds)) as AxiosResponse<
    TGetPlayabilityStatus[]
  >;
  return data[0];
};

const getGuacPlayButtonUI = async (): Promise<TGuacPlayButtonUIResponse> =>
  callBehaviour<TGuacPlayButtonUIResponse>("play-button-ui");

const getShowAgeVerificationOverlay = async (
  universeId: string,
): Promise<TShowAgeVerificationOverlayResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${environmentUrls.voiceApi}/v1/settings/verify/show-age-verification-overlay/${universeId}`,
  };
  const { data } = await http.get<TShowAgeVerificationOverlayResponse>(urlConfig);
  return data;
};

const postOptUserInToVoiceChat = async (
  isUserOptIn: boolean,
): Promise<TPostOptUserInToVoiceChatResponse> => {
  const urlConfig = {
    withCredentials: true,
    url: `${environmentUrls.voiceApi}/v1/settings/user-opt-in`,
  };
  const params = {
    isUserOptIn,
  };
  // This endpoint returns isUserOptIn which will match the input params if successful.
  const { data } = await http.post<TPostOptUserInToVoiceChatResponse>(urlConfig, params);
  return data;
};

const getUserSettingsAndOptions = (): Promise<TGetUserSettingsAndOptionsResponse> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings/settings-and-options`,
    withCredentials: true,
  };

  return http.get<TGetUserSettingsAndOptionsResponse>(urlConfig).then(response => response.data);
};

const getAgeRecommendation = (universeId: string): Promise<TAgeGuidelinesResponse> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/experience-guidelines-api/experience-guidelines/get-age-recommendation`,
    withCredentials: true,
  };

  return http
    .post<TAgeGuidelinesResponse>(urlConfig, {
      universeId,
    })
    .then(response => response.data);
};

const getFiatPurchaseUrl = (rootPlaceId: string, expectedBasePriceId: string): Promise<string> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/fiat-paid-access-service/v1/purchase`,
    withCredentials: true,
    retryable: true,
  };

  return http
    .post<TFiatPreparePurchaseResponse>(urlConfig, {
      rootPlaceId,
      expectedBasePriceId,
    })
    .then(response => {
      // TODO: old, migrate dcode
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const parsedCheckoutUrlData = JSON.parse(
        // TODO: old, migrate dcode
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        response.data.checkoutUrl ?? "",
      ) as TFiatPreparePurchaseCheckoutUrl;
      // TODO: old, migrate dcode
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return parsedCheckoutUrlData.checkoutUrl ?? "";
    });
};

export default {
  getProductInfo,
  getProductDetails,
  getPlayabilityStatus,
  getShowAgeVerificationOverlay,
  getGuacPlayButtonUI,
  postOptUserInToVoiceChat,
  getUserSettingsAndOptions,
  getAgeRecommendation,
  getFiatPurchaseUrl,
};
