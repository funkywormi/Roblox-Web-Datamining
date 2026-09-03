import { urlService } from "core-utilities";
import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  getAuthorizationsUrl,
  getScopesUrl,
  getDeleteAuthorizationUrl,
  reportOAuthAppUrl,
} from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";
import { SafetyEvent } from "../../types/abuseReportTypes";
import { TAuthorizationsBody, TScopesResponse } from "../../types/appPermissionsTypes";
import ApiCacheTag from "./common/cacheTagEnum";

const oauthApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAuthorizations: builder.query<TAuthorizationsBody, string | void>({
      query: (cursor: string | void): TBaseQueryArgs => ({
        url: urlService.getUrlWithQueries(getAuthorizationsUrl, { cursor, limit: 5 }),
      }),
      serializeQueryArgs: () => {
        // This gives all queries the same cache key, even if query args differ
        // So that we can merge together the data from all queries.
        return ApiCacheTag.OAuthorizations;
      },
      merge: (currentCache, newItems) => {
        if (currentCache) {
          const result: TAuthorizationsBody = {
            authorizations: [...currentCache.authorizations, ...newItems.authorizations],
            nextPageCursor: newItems.nextPageCursor,
          };
          return result;
        }
        return newItems;
      },
    }),
    deleteAuthorization: builder.mutation<void, string>({
      query: (authorizationId: string): TBaseQueryArgs => ({
        method: HttpMethod.DELETE,
        url: getDeleteAuthorizationUrl(authorizationId),
      }),
      async onQueryStarted(authorizationId: string, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Pessimistically remove the deleted authorization from the list
        dispatch(
          oauthApi.util.updateQueryData("getAuthorizations", ApiCacheTag.OAuthorizations, draft => {
            const index = draft.authorizations.findIndex(
              auth => auth.authorizationId === authorizationId,
            );
            if (index !== -1) {
              draft.authorizations.splice(index, 1);
            }
          }),
        );
      },
    }),
    getScopes: builder.query<TScopesResponse, void>({
      query: (): TBaseQueryArgs => ({
        url: getScopesUrl,
      }),
    }),
    reportOAuthApplication: builder.mutation<void, SafetyEvent>({
      query: (requestBody: SafetyEvent): TBaseQueryArgs => ({
        url: reportOAuthAppUrl,
        postBody: requestBody,
      }),
    }),
  }),
});

export const {
  useGetAuthorizationsQuery,
  useLazyGetAuthorizationsQuery,
  useGetScopesQuery,
  useDeleteAuthorizationMutation,
  useReportOAuthApplicationMutation,
} = oauthApi;
