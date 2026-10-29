import { AxiosPromise } from "axios";
import * as GamesProvider from "../../providers/games/gamesProvider";
import * as GamesV2Provider from "../../providers/gamesV2/gamesV2Provider";

const gamesApiInstance = new GamesProvider.GamesApi();
const gamesV2ApiInstance = new GamesV2Provider.GamesApi();
const getUniverseMedia = (
  universeId: number,
): AxiosPromise<GamesV2Provider.RobloxWebWebAPIModelsApiArrayResponseRobloxWebResponsesGamesGameMediaItemResponseV2> =>
  gamesV2ApiInstance.v2GamesUniverseIdMediaGet(universeId, { withCredentials: true });

const getPlayabilityStatus = (
  universeIds: number[],
): AxiosPromise<GamesProvider.RobloxGamesApiModelsResponsePlayabilityStatusResponse[]> =>
  gamesApiInstance.v1GamesMultigetPlayabilityStatusGet(universeIds, {
    withCredentials: true,
  });

const getPlaceDetails = (
  placeIds: number[],
): AxiosPromise<GamesProvider.RobloxGamesApiModelsResponsePlaceDetails[]> =>
  gamesApiInstance.v1GamesMultigetPlaceDetailsGet(placeIds, { withCredentials: true });

const getProductInfo = (
  universeIds: number[],
): AxiosPromise<GamesProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGamesApiModelsResponseGameProductResponse> =>
  gamesApiInstance.v1GamesGamesProductInfoGet(universeIds, { withCredentials: true });

const getGameDetails = (
  universeIds: number[],
  languageCode?: string,
): AxiosPromise<GamesProvider.RobloxWebWebAPIModelsApiArrayResponseRobloxGamesApiModelsResponseGameDetailResponse> =>
  gamesApiInstance.v1GamesGet(universeIds, languageCode, { withCredentials: true });

export default {
  getUniverseMedia,
  getPlayabilityStatus,
  getPlaceDetails,
  getProductInfo,
  getGameDetails,
};
