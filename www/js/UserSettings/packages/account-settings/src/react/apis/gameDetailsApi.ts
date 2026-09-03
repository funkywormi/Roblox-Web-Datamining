import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import {
  TGamesResponse,
  TGamesMap,
  TAgeRecommendationsResponse,
  TAgeRecommendationMap,
} from "../../types/gamesTypes";
import { ageRecommendationUrl, gamesEndpointUrl } from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";
import { HttpMethod } from "./common/httpServiceBaseQueryFn";

const generateGamesMap = (response: TGamesResponse): TGamesMap => {
  // Converts the array of games into a map of id to game objects
  return response.data.reduce<TGamesMap>((accumulator, game) => {
    accumulator[game.id] = game;
    return accumulator;
  }, {});
};

const generateAgeRecommendationMap = (
  response: TAgeRecommendationsResponse,
): TAgeRecommendationMap => {
  // Converts the array of age recommendations into a map of universeId to age recommendation objects
  return response.ageRecommendationDetailsByUniverse.reduce<TAgeRecommendationMap>(
    (accumulator, item) => {
      const summary = item.ageRecommendationDetails.ageRecommendationSummary.ageRecommendation;
      accumulator[item.universeId] = {
        universeId: item.universeId,
        maturityRating: summary?.displayName,
        contentMaturity: summary?.contentMaturity,
      };
      return accumulator;
    },
    {},
  );
};

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export const gameDetailsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getGamesDetails: builder.query<TGamesMap, (string | number)[]>({
      queryFn: async (universeIds: (string | number)[], _queryApi, _extraOptions, baseQuery) => {
        const chunks = chunkArray(universeIds, 50); // Split the universeIds into chunks of 50
        const queryResult = await Promise.all(
          chunks.map(
            chunk =>
              baseQuery({
                url: gamesEndpointUrl,
                queryParams: { universeIds: chunk.join(",") },
              }) as QueryReturnValue<TGamesResponse>,
          ),
        );

        const combinedResponse = queryResult.reduce<TGamesResponse>(
          (acc, result) => {
            if (result.data) {
              acc.data.push(...result.data.data);
            }
            return acc;
          },
          { data: [] },
        );

        return { data: generateGamesMap(combinedResponse) };
      },
    }),
    getAgeRecommendation: builder.query<TAgeRecommendationMap, number[]>({
      query: universeIds => ({
        url: ageRecommendationUrl,
        method: HttpMethod.POST,
        postBody: { universeIds },
      }),
      transformResponse: (response: TAgeRecommendationsResponse) => {
        return generateAgeRecommendationMap(response);
      },
    }),
  }),
});

export const { useGetGamesDetailsQuery, useGetAgeRecommendationQuery } = gameDetailsApi;
