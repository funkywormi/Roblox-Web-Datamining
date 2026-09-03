import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";
import { omniSearchUrl } from "../userSettings/constants/urlConstants";
import { TGetOmniSearchResponse, TOmniSearchQueryParams } from "../../types/omniSearchTypes";

const getExperienceSearchCacheTag = (searchQuery: string): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ExperienceSearch, id: searchQuery };
};

export const experienceSearchApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getExperiences: builder.query<TGetOmniSearchResponse, TOmniSearchQueryParams>({
      query: (params: TOmniSearchQueryParams): TBaseQueryArgs => ({
        url: omniSearchUrl,
        queryParams: params,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // Assigns a cache key based on the search query to enable merging paginated results.
        return getExperienceSearchCacheTag(queryArgs.searchQuery);
      },
      merge: (currentCache, newItems) => {
        if (currentCache) {
          const result: TGetOmniSearchResponse = {
            searchResults: [...currentCache.searchResults, ...newItems.searchResults],
            nextPageToken: newItems.nextPageToken,
          };
          return result;
        }
        return newItems;
      },
    }),
  }),
});

export const { useLazyGetExperiencesQuery } = experienceSearchApi;
