import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { getChildTransferLimitUrl, TGetChildTransferLimitResponse } from "@rbx/user-settings";
import baseApi from "./common/baseApi";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import ApiCacheTag from "./common/cacheTagEnum";

export const getChildTransferLimitCacheTag = (
  childUserId: number,
): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ChildTransferLimitsType, id: childUserId };
};

export const transferLimitsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Parent load for the per-child Robux transfer limits page. Reads from
    // transfer-api, which authorizes the parent against the child link; the
    // matching save goes through parental-controls-api grant-consent.
    getChildTransferLimit: builder.query<TGetChildTransferLimitResponse, number>({
      query: (childUserId: number): TBaseQueryArgs => ({
        url: getChildTransferLimitUrl,
        queryParams: { childUserId },
      }),
      providesTags: (_result, _error, childUserId) => [getChildTransferLimitCacheTag(childUserId)],
    }),
  }),
});

export const { useGetChildTransferLimitQuery } = transferLimitsApi;
