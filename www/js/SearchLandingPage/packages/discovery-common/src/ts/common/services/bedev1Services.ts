import * as http from "@rbx/core-scripts/http";
import dataStores from "@rbx/core-scripts/data-store";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import bedev1Constants from "../constants/bedev1Constants";
import {
  TGetFriendsResponse,
  TGetPlaceDetails,
  TGetGameDetails,
  TGameData,
  TGetUniverseVoiceStatus,
  TGetUserLocaleResponse,
  TSupportedLocale,
  TAssetDataResponse,
  TGetPlayabilityStatus,
} from "../types/bedev1Types";

const { url, defaultCacheCriteria } = bedev1Constants;
const { gamesDataStore, userDataStoreV2, localeDataStore } = dataStores;
const { FriendsUserSortType } = dataStores.userDataStore;

export const getGameRecommendations = async (
  universeId: string,
  max: number,
): Promise<{ games: TGameData[] }> => {
  const { data } = await http.get(bedev1Constants.url.getGameRecommendations(universeId), {
    maxRows: max,
  });
  return data as Promise<{ games: TGameData[] }>;
};

export const getFriendsPresence = (): Promise<{ userData?: TGetFriendsResponse[] }> => {
  return userDataStoreV2.getFriends(
    {
      userId: authenticatedUser()?.id!,
      userSort: FriendsUserSortType.StatusFrequents,
      isGuest: false,
    },
    defaultCacheCriteria,
  ) as Promise<{ userData?: TGetFriendsResponse[] }>;
};

export const getPlaceDetails = async (placeId: string): Promise<TGetPlaceDetails> => {
  const { data = [] } = await gamesDataStore.getPlaceDetails([placeId as unknown as number]);
  return data[0] as TGetPlaceDetails;
};

export const getGameDetails = async (
  universeId: string,
  languageCode?: string,
): Promise<TGetGameDetails> => {
  const {
    data: { data },
  } = await gamesDataStore.getGameDetails([universeId as unknown as number], languageCode);
  return data![0] as unknown as TGetGameDetails;
};

export const getVoiceStatus = async (universeId: string): Promise<TGetUniverseVoiceStatus> => {
  const { data } = await http.get<TGetUniverseVoiceStatus>(
    bedev1Constants.url.getUniverseVoiceStatus(universeId),
  );

  return data;
};

export const getUserLocale = (): Promise<TSupportedLocale | undefined> => {
  return localeDataStore
    .getUserLocale()
    .then(res => res.data)
    .then((res: TGetUserLocaleResponse) => res?.ugc ?? res?.signupAndLogin);
};

const getAssetDataFromAssetId = (assetId: string): Promise<TAssetDataResponse> => {
  return http
    .get<TAssetDataResponse>(bedev1Constants.url.getAssetDataFromAssetId(assetId))
    .then(response => {
      return response.data;
    });
};

const getPlayabilityStatus = async (
  universeId: string,
): Promise<TGetPlayabilityStatus | undefined> => {
  const { data = [] } = await gamesDataStore.getPlayabilityStatus([
    universeId as unknown as number,
  ]);

  return data[0] as TGetPlayabilityStatus;
};

export default {
  getFriendsPresence,
  getGameDetails,
  getGameRecommendations,
  getVoiceStatus,
  getPlaceDetails,
  getUserLocale,
  getAssetDataFromAssetId,
  getPlayabilityStatus,
};
