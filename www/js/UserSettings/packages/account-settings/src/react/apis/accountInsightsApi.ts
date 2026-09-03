import { ageGroupUrl } from "@rbx/user-settings";
import baseApi from "./common/baseApi";
import { TAgeGroupResponse, TAgeGroupRequest } from "../../types/accountInformationTypes";
import ApiCacheTag from "./common/cacheTagEnum";

export const accountInsightsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAgeGroup: builder.query<TAgeGroupResponse, TAgeGroupRequest>({
      query: request => {
        // no request or no bustcache
        if (!request?.bustCache) {
          return { url: ageGroupUrl };
        }

        return {
          url: ageGroupUrl,
          params: { cacheBuster: Date.now() },
        };
      },
      providesTags: [ApiCacheTag.AgeGroup],
    }),
  }),
});

export const { useGetAgeGroupQuery } = accountInsightsApi;
