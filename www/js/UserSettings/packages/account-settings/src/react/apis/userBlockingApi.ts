import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { authenticatedUser } from "header-scripts";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  blockedUsersEndpointUrl,
  getUnblockUserEndpointUrlV2,
} from "../userSettings/constants/urlConstants";
import {
  TBlockedUsersResponse,
  TBlockedUsersProps,
  TBlockManagerType,
  TUnblockUserRequest,
} from "../../types/privacyTypes";
import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import { blockUserErrorCodeToStringKeys } from "../userSettings/constants/errorCodeToStringKeyMappings";
import { BlockUserErrorCode } from "../../enums/errorCodes";

type TBlockUserError = {
  data: BlockUserErrorCode;
};

export const getBlockedUsersCacheTag = (
  userId: number,
  managerType: TBlockManagerType,
): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.BlockedUsers, id: `${userId}_${managerType || ""}` };
};

export const userBlockingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBlockedUsers: builder.query<TBlockedUsersResponse, TBlockedUsersProps>({
      query: (params: TBlockedUsersProps): TBaseQueryArgs => ({
        url: blockedUsersEndpointUrl,
        queryParams: params,
      }),
      merge: (currentCache, newItems) => {
        if (currentCache) {
          const result: TBlockedUsersResponse = {
            data: {
              cursor: newItems.data.cursor,
              blockedUsers: [
                ...(currentCache.data.blockedUsers || []),
                ...(newItems.data.blockedUsers || []),
              ],
            },
            error: newItems.error,
          };
          return result;
        }
        return newItems;
      },
      keepUnusedDataFor: 0,
      serializeQueryArgs: ({ queryArgs }) => {
        // This gives all queries with the same childUserId the same cache key
        // So that we can merge together the data from all queries.
        return getBlockedUsersCacheTag(
          queryArgs.childUserId ?? authenticatedUser.id!,
          queryArgs.managerTypeFilter ?? TBlockManagerType.Unspecified,
        );
      },
      providesTags: (result, error, body) => [
        getBlockedUsersCacheTag(
          body.childUserId ?? authenticatedUser.id!,
          body.managerTypeFilter ?? TBlockManagerType.Unspecified,
        ),
      ],
    }),
    unblockUser: builder.mutation<void, TUnblockUserRequest>({
      query: (request: TUnblockUserRequest): TBaseQueryArgs => ({
        url: getUnblockUserEndpointUrlV2(request.blockedUser.blockedUserId),
      }),
      async onQueryStarted(request: TUnblockUserRequest, { dispatch, queryFulfilled }) {
        await queryFulfilled;

        const managerTypesToUpdate: TBlockManagerType[] = [
          TBlockManagerType.Unspecified,
          TBlockManagerType.Blocker,
        ];

        managerTypesToUpdate.forEach(managerType => {
          dispatch(
            userBlockingApi.util.updateQueryData(
              "getBlockedUsers",
              {
                childUserId: authenticatedUser.id!,
                managerTypeFilter: managerType,
              },
              draft => {
                const userIndex = draft.data.blockedUsers.findIndex(
                  user => user.blockedUserId === request.blockedUser.blockedUserId,
                );
                if (userIndex !== -1) {
                  draft.data.blockedUsers.splice(userIndex, 1);
                }
              },
            ),
          );
        });
      },
      transformErrorResponse: (err: unknown): string => {
        const errorCode = (err as TBlockUserError).data;
        return blockUserErrorCodeToStringKeys[errorCode] || commonTranslationConstants.unknownError;
      },
    }),
  }),
});

export const { useGetBlockedUsersQuery, useUnblockUserMutation, useLazyGetBlockedUsersQuery } =
  userBlockingApi;
