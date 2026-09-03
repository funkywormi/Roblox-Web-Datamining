import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { authenticatedUser } from "header-scripts";
import { MaybeDrafted } from "@reduxjs/toolkit/dist/query/core/buildThunks";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import {
  cancelPendingConsentEndpoint,
  CancelPendingConsentErrorCode,
  childSettingsUrl,
  childSettingsV2Url,
  childrenInfoUrl,
  getAnswerConsentRequestEndpoint,
  getRemoveLinkUrl,
  getParentLinkSettingsUrl,
  getTopWeeklyScreentimeByUniverseUrl,
  getWeeklyScreentimeUrl,
  grantConsentUrl,
  parentalControlsConsentEndpoint,
  ParentalControlsErrorCode,
  parentInfoUrl,
  TUserSettingsAndOptionsBody,
  TUserSettingsAndOptionsV2Body,
  TParentLinkSettingsResponse,
  TUpdateParentLinkSettingsRequest,
} from "@rbx/user-settings";
import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  findFriendsEndpointUrl,
  friendsCountEndpointUrl,
  getVerificationPageUrl,
} from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";
import {
  ParentConsentStatus,
  ParentConsentType,
  TCancelPendingConsentError,
  TGetConsentsRequest,
  TGetConsentsResponse,
  TAnswerConsentRequest,
  TConsentResponse,
  TGrantConsentRequest,
  ManagementAction,
} from "../../types/parentConsentsTypes";
import {
  FindFriendsTypes,
  FindFriendsUserSort,
  TFindFriendsRequest,
  TFindFriendsResponse,
  TFriendsCountResponse,
} from "../../types/friendsTypes";
import ApiCacheTag from "./common/cacheTagEnum";
import { TGetChildrenInfoResponse } from "../../types/childrenInfoTypes";
import { TGetLinkedParentsResponse } from "../../types/parentInfoTypes";
import {
  TGetTopWeeklyScreentimeByUniverseResponse,
  TGetWeeklyScreentimeResponse,
} from "../../types/screentimeTypes";
import { updateChildPagesState } from "./slices/childPagesSlice";
import {
  TUpdateSettingConsentRequirementsPayload,
  TUpdateSettingConsentRequirementsV2Payload,
  updateSettingConsentRequirementsState,
  updateSettingConsentRequirementsV2State,
} from "./slices/parentalConsentSlice";
import { getBlockedUsersCacheTag, userBlockingApi } from "./userBlockingApi";
import { TBlockManagerType } from "../../types/privacyTypes";
import {
  getApprovedExperiencesCacheTag,
  getBlockedExperiencesCacheTag,
} from "./experienceBlockingApi";
import { getChildSpendControlsSettingsCacheTag } from "./billingApi";

export const getChildSettingsCacheTag = (childUserId: number): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ChildSettingsType, id: childUserId };
};

export const getParentLinkSettingsCacheTag = (
  childUserId: number,
): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ParentLinkSettings, id: childUserId };
};

const getChildFriendsCacheTag = (
  childUserId: number,
  findFriendsType: FindFriendsTypes,
): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ChildFriendsType, id: `${childUserId}_${findFriendsType}` };
};

export type TParentalControlsError = {
  data: {
    code: ParentalControlsErrorCode;
  };
};

const getParentalConsentsCacheTag = (
  childUserId: number,
  consentStatus: ParentConsentStatus,
  consentType?: ParentConsentType,
): FullTagDescription<ApiCacheTag> => {
  const typeKey = consentType ?? "ALL";
  return {
    type: ApiCacheTag.ParentalConsentsType,
    id: `${childUserId}_${consentStatus}_${typeKey}`,
  };
};

const ALL_CONSENT_TYPES = Object.values(ParentConsentType);

/**
 * Returns cache tags for all consent caches (ALL + each type-specific).
 * Use this to invalidate all consent caches for a user.
 */
export const getAllParentalConsentsCacheTags = (
  childUserId: number,
  consentStatus: ParentConsentStatus,
): FullTagDescription<ApiCacheTag>[] => {
  return [
    getParentalConsentsCacheTag(childUserId, consentStatus), // "ALL" cache
    ...ALL_CONSENT_TYPES.map(consentType =>
      getParentalConsentsCacheTag(childUserId, consentStatus, consentType),
    ),
  ];
};

const removeConsentFromCache = (draft: TGetConsentsResponse, consentId: string) => {
  const index = draft.consents.findIndex(consent => consent.id === consentId);
  if (index !== -1) {
    draft.consents.splice(index, 1);
  }
};

const removeChildFriendFromCache = (
  draft: MaybeDrafted<TFindFriendsResponse>,
  friendId: number,
): MaybeDrafted<TFindFriendsResponse> => {
  if (!draft) return draft;

  return {
    ...draft,
    PageItems: draft?.PageItems.filter(friend => friend?.id !== friendId),
  };
};

const removeChildFriendFromCountCache = (
  draft: MaybeDrafted<TFriendsCountResponse>,
): MaybeDrafted<TFriendsCountResponse> => {
  if (!draft) return draft;

  return {
    ...draft,
    count: draft.count - 1,
  };
};

const normalizeConsentData = (consents: TConsentResponse[]): TConsentResponse[] =>
  consents.map(consent => ({
    ...consent,
    consentData: consent.consentData
      ? {
          ...consent.consentData,
          friendUserId:
            consent.consentData.friendUserId != null
              ? Number(consent.consentData.friendUserId)
              : undefined,
          universeId:
            consent.consentData.universeId != null
              ? Number(consent.consentData.universeId)
              : undefined,
        }
      : undefined,
  }));

export const parentalControlsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getParentalConsents: builder.query<TGetConsentsResponse, TGetConsentsRequest>({
      queryFn: async (
        arg: TGetConsentsRequest,
        _api,
        _extraOptions,
        baseQuery,
      ): Promise<QueryReturnValue<TGetConsentsResponse>> => {
        if (arg.fetchSinglePageOnly) {
          // Fetch only the first page for pagination
          const consentsQueryResult = (await baseQuery({
            url: parentalControlsConsentEndpoint,
            queryParams: { ...arg, cursor: arg.cursor },
          })) as QueryReturnValue<TGetConsentsResponse>;

          if (consentsQueryResult.error) {
            return { error: consentsQueryResult.error };
          }

          const { data } = consentsQueryResult;
          return {
            data: {
              consents: normalizeConsentData(data?.consents || []),
              nextCursor: data?.nextCursor,
            },
          };
        }

        // Recursively fetch all pages
        let nextCursor = arg.cursor;
        let allConsents: TConsentResponse[] = [];

        const getConsents = async (): Promise<
          QueryReturnValue<TGetConsentsResponse> | undefined
        > => {
          const consentsQueryResult = (await baseQuery({
            url: parentalControlsConsentEndpoint,
            queryParams: { ...arg, cursor: nextCursor },
          })) as QueryReturnValue<TGetConsentsResponse>;

          if (consentsQueryResult.error) {
            return { error: consentsQueryResult.error };
          }

          const { data } = consentsQueryResult;
          allConsents = [...allConsents, ...(data?.consents || [])];
          nextCursor = data?.nextCursor;

          if (nextCursor) {
            return getConsents();
          }
          return undefined;
        };

        await getConsents();

        return { data: { consents: normalizeConsentData(allConsents), nextCursor: undefined } };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // This gives all queries with the same childUserId, consentStatus, and consentType the same cache key
        // So that we can merge together the data from all queries.
        return getParentalConsentsCacheTag(
          queryArgs.childUserId,
          queryArgs.consentStatus,
          queryArgs.consentType,
        );
      },
      merge: (currentCache, newData, { arg }) => {
        if (arg.fetchSinglePageOnly) {
          // For paginated fetches, append new consents to existing cache
          if (currentCache && arg.cursor) {
            return {
              consents: [...currentCache.consents, ...newData.consents],
              nextCursor: newData.nextCursor,
            };
          }
          return newData;
        }

        return newData;
      },
      providesTags: (_result, _error, request) => [
        getParentalConsentsCacheTag(
          request.childUserId,
          request.consentStatus,
          request.consentType,
        ),
      ],
    }),
    getChildFriends: builder.query<TFindFriendsResponse, TFindFriendsRequest>({
      query: (args: TFindFriendsRequest): TBaseQueryArgs => ({
        url: findFriendsEndpointUrl(args.userId),
        queryParams: args,
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        // This gives all queries with the same childUserId the same cache key
        // So that we can merge together the data from all queries.
        return getChildFriendsCacheTag(queryArgs.userId, queryArgs.findFriendsType);
      },
      merge: (currentCache, newItems) => {
        if (currentCache) {
          const result: TFindFriendsResponse = {
            PreviousCursor: newItems?.PreviousCursor,
            PageItems: [...currentCache.PageItems, ...newItems.PageItems],
            NextCursor: newItems?.NextCursor,
            HasMore: newItems.HasMore,
          };
          return result;
        }
        return newItems;
      },
      providesTags: (result, error, request) => [
        getChildFriendsCacheTag(request.userId, request.findFriendsType),
      ],
    }),
    getChildFriendsCount: builder.query<TFriendsCountResponse, number>({
      query: (userId: number): TBaseQueryArgs => ({
        url: friendsCountEndpointUrl(userId),
        queryParams: { userId },
      }),
    }),
    manageChildFriend: builder.mutation<void, TGrantConsentRequest>({
      query: (manageChildFriendRequest: TGrantConsentRequest): TBaseQueryArgs => ({
        url: grantConsentUrl,
        postBody: manageChildFriendRequest,
      }),
      async onQueryStarted(args: TGrantConsentRequest, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        if (args.details.friendManagementAction === ManagementAction.Block) {
          // Remove friend from friend cache
          dispatch(
            parentalControlsApi.util.updateQueryData(
              "getChildFriends",
              {
                userId: args.childUserId,
                userSort: FindFriendsUserSort.FriendScore,
                findFriendsType: FindFriendsTypes.Friends, // Parents can not currently remove trusted friends, so no need to worry about clearing that cache
              },
              draft => {
                if (args.details.friendUserId) {
                  return removeChildFriendFromCache(draft, args.details.friendUserId);
                }
                return draft;
              },
            ),
          );

          dispatch(
            parentalControlsApi.util.updateQueryData(
              "getChildFriendsCount",
              args.childUserId,
              (draft: TFriendsCountResponse) => {
                return removeChildFriendFromCountCache(draft);
              },
            ),
          );

          // Add user to blocked users cache
          if (args.details.friendUserId) {
            // This should always be true, but just in case
            dispatch(
              userBlockingApi.util.updateQueryData(
                "getBlockedUsers",
                {
                  childUserId: args.childUserId,
                  managerTypeFilter: TBlockManagerType.Parent,
                },
                draft => {
                  draft.data.blockedUsers.push({
                    blockedUserId: Number(args.details.friendUserId),
                    blockManagerType: TBlockManagerType.Parent,
                  });
                },
              ),
            );
          }
        } else if (args.details.friendManagementAction === ManagementAction.Unblock) {
          // Remove user from blocked users cache
          const managerTypesToUpdate: TBlockManagerType[] = [
            TBlockManagerType.Parent,
            TBlockManagerType.Unspecified,
          ];

          managerTypesToUpdate.forEach(managerType => {
            dispatch(
              userBlockingApi.util.updateQueryData(
                "getBlockedUsers",
                {
                  childUserId: args.childUserId,
                  managerTypeFilter: managerType,
                },
                draft => {
                  const userIndex = draft.data.blockedUsers.findIndex(
                    user => user.blockedUserId === Number(args.details.friendUserId),
                  );
                  if (userIndex !== -1) {
                    draft.data.blockedUsers.splice(userIndex, 1);
                  }
                },
              ),
            );
          });
        }
      },
      transformErrorResponse: (err: unknown, _meta, arg): ParentalControlsErrorCode => {
        const errorCode = (err as TParentalControlsError).data.code;
        if (errorCode === ParentalControlsErrorCode.ParentNotVerified) {
          window.location.href = getVerificationPageUrl(arg.childUserId);
        }
        return errorCode;
      },
      invalidatesTags: (_result, _response, body) => [
        ...getAllParentalConsentsCacheTags(body.childUserId, ParentConsentStatus.Pending),
      ],
    }),
    cancelPendingConsent: builder.mutation<void, string>({
      query: (consentId: string): TBaseQueryArgs => ({
        url: cancelPendingConsentEndpoint,
        postBody: { consentId },
      }),
      transformErrorResponse: (err: TCancelPendingConsentError): CancelPendingConsentErrorCode => {
        return err?.data?.code ?? CancelPendingConsentErrorCode.Unknown;
      },
      async onQueryStarted(consentId: string, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        // Pessimistically remove from the "ALL" cache
        dispatch(
          parentalControlsApi.util.updateQueryData(
            "getParentalConsents",
            {
              childUserId: authenticatedUser.id!,
              consentStatus: ParentConsentStatus.Pending,
            },
            draft => {
              removeConsentFromCache(draft, consentId);
            },
          ),
        );
        // Also remove from all type-specific caches
        ALL_CONSENT_TYPES.forEach(consentType => {
          dispatch(
            parentalControlsApi.util.updateQueryData(
              "getParentalConsents",
              {
                childUserId: authenticatedUser.id!,
                consentStatus: ParentConsentStatus.Pending,
                consentType,
              },
              draft => {
                removeConsentFromCache(draft, consentId);
              },
            ),
          );
        });
      },
    }),
    answerConsentRequest: builder.mutation<Promise<unknown>, TAnswerConsentRequest>({
      query: (answerConsentRequest: TAnswerConsentRequest): TBaseQueryArgs => {
        const { auditDataHeader, ...postBody } = answerConsentRequest;
        return {
          url: getAnswerConsentRequestEndpoint(answerConsentRequest.consentId),
          postBody,
          headers: {
            ...(auditDataHeader && { "rbx-audit-data": auditDataHeader }),
          },
        };
      },
      async onQueryStarted(
        answerConsentRequest: TAnswerConsentRequest,
        { dispatch, queryFulfilled },
      ) {
        await queryFulfilled;
        // Pessimistically remove from the "ALL" cache
        dispatch(
          parentalControlsApi.util.updateQueryData(
            "getParentalConsents",
            {
              childUserId: answerConsentRequest.childUserId,
              consentStatus: ParentConsentStatus.Pending,
            },
            draft => {
              removeConsentFromCache(draft, answerConsentRequest.consentId);
            },
          ),
        );
        // Also remove from all type-specific caches
        ALL_CONSENT_TYPES.forEach(consentType => {
          dispatch(
            parentalControlsApi.util.updateQueryData(
              "getParentalConsents",
              {
                childUserId: answerConsentRequest.childUserId,
                consentStatus: ParentConsentStatus.Pending,
                consentType,
              },
              draft => {
                removeConsentFromCache(draft, answerConsentRequest.consentId);
              },
            ),
          );
        });
      },
      invalidatesTags: (_result, _response, body) => {
        return [
          getChildSettingsCacheTag(body.childUserId), // Invalidate the child settings cache
          getBlockedUsersCacheTag(body.childUserId, TBlockManagerType.Parent), // Invalidate the child blocked users cache
          getBlockedExperiencesCacheTag(body.childUserId), // Invalidate the child blocked experiences cache
          getApprovedExperiencesCacheTag(body.childUserId), // Invalidate the child approved experiences cache
          ApiCacheTag.ChildrenInfo, // Invalidate the children info cache (birthdays etc)
        ];
      },
    }),
    getChildrenInfo: builder.query<TGetChildrenInfoResponse, void>({
      query: (): TBaseQueryArgs => ({
        url: childrenInfoUrl,
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled;
        dispatch(updateChildPagesState(data));
      },
      providesTags: [ApiCacheTag.ChildrenInfo],
    }),
    getParentInfo: builder.query<TGetLinkedParentsResponse, void>({
      query: (): TBaseQueryArgs => ({
        url: parentInfoUrl,
      }),
      providesTags: [ApiCacheTag.ParentInfo],
    }),
    getChildSettings: builder.query<TUserSettingsAndOptionsBody, number>({
      query: (childUserId: number): TBaseQueryArgs => ({
        url: childSettingsUrl,
        queryParams: { childUserId },
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const body: TUpdateSettingConsentRequirementsPayload = {
            userId: _arg,
            settingsAndOptionsBody: data,
          };
          dispatch(updateSettingConsentRequirementsState(body));
        } catch (error) {
          // error handling is handled in transformErrorResponse callback below.
        }
      },
      transformResponse: (response: TUserSettingsAndOptionsBody) => {
        const cleanedResponse = { ...response };
        Object.entries(response).forEach(setting => {
          const [settingName, settingsAndOptions] = setting;
          if (
            settingsAndOptions?.options === undefined ||
            settingsAndOptions?.options?.length === 0
          ) {
            // If there are no options, remove the setting from the response.
            delete cleanedResponse[settingName as keyof TUserSettingsAndOptionsBody];
          }
        });
        return cleanedResponse;
      },
      providesTags: (result, error, childUserId) => [getChildSettingsCacheTag(childUserId)],
    }),
    getChildSettingsV2: builder.query<TUserSettingsAndOptionsV2Body, number>({
      query: (childUserId: number): TBaseQueryArgs => ({
        url: childSettingsV2Url,
        queryParams: { childUserId },
      }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const body: TUpdateSettingConsentRequirementsV2Payload = {
            userId: _arg,
            settingsAndOptionsBody: data,
          };
          dispatch(updateSettingConsentRequirementsV2State(body));
        } catch (error) {
          // error handling is handled in transformErrorResponse callback below.
        }
      },
      transformResponse: (response: TUserSettingsAndOptionsV2Body) => {
        const cleanedResponse = { ...response };
        Object.entries(response).forEach(setting => {
          const [settingName, settingsAndOptions] = setting;
          if (
            settingsAndOptions?.options === undefined ||
            settingsAndOptions?.options?.length === 0
          ) {
            // If there are no options, remove the setting from the response.
            delete cleanedResponse[settingName as keyof TUserSettingsAndOptionsV2Body];
          }
        });
        return cleanedResponse;
      },
      providesTags: (result, error, childUserId) => [getChildSettingsCacheTag(childUserId)],
    }),
    removeChildLink: builder.mutation<void, number>({
      query: (childUserId: number): TBaseQueryArgs => ({
        url: getRemoveLinkUrl(childUserId),
        method: HttpMethod.DELETE,
      }),
      invalidatesTags: (_result, _response, body) => {
        return [
          // This does NOT auto-invalidate ApiCacheTag.ChildrenInfo.
          // We manually refetch childrenInfo in useHandleUnlinkChild
          // to ensure redirection happens only after unlinking and refetching complete.
          getChildSettingsCacheTag(body),
          getChildFriendsCacheTag(body, FindFriendsTypes.Friends),
          getChildFriendsCacheTag(body, FindFriendsTypes.TrustedFriends),
          ...getAllParentalConsentsCacheTags(body, ParentConsentStatus.Pending),
        ];
      },
    }),
    initiateConsentByParent: builder.mutation<{}, TGrantConsentRequest>({
      query: (initialConsentRequestPayload: TGrantConsentRequest): TBaseQueryArgs => {
        return {
          url: grantConsentUrl,
          postBody: initialConsentRequestPayload,
        };
      },
      transformResponse: (response): {} => {
        // Force a pessimistic update as birthdate takes a while to settle
        // down. This effectively delays refetch of endpoints that need to be
        // refreshed after the birthdate is changed. It also allows us (if
        // desired) to indicate to the user the birthdate change is still in
        // flight.
        return new Promise(resolve => {
          setTimeout(resolve, 2000, response);
        });
      },
      invalidatesTags: (_result, _response, body) => {
        const tags: (ApiCacheTag | FullTagDescription<ApiCacheTag>)[] = [
          ApiCacheTag.ChildrenInfo,
          getChildSettingsCacheTag(body.childUserId),
          ...getAllParentalConsentsCacheTags(body.childUserId, ParentConsentStatus.Pending),
        ];
        if (
          body.details.monthlySpendLimit !== undefined ||
          body.details.monthlySpendLimitCurrencyCode !== undefined ||
          body.details.monthlySpendLimitNotificationType !== undefined
        ) {
          tags.push(getChildSpendControlsSettingsCacheTag(body.childUserId));
        }
        return tags;
      },
    }),
    getWeeklyScreentime: builder.query<TGetWeeklyScreentimeResponse, number | undefined>({
      query: (userId: number | undefined): TBaseQueryArgs => ({
        url: getWeeklyScreentimeUrl,
        queryParams: { userId },
      }),
    }),
    getTopWeeklyScreentimeByUniverse: builder.query<
      TGetTopWeeklyScreentimeByUniverseResponse,
      number | undefined
    >({
      query: (userId: number | undefined): TBaseQueryArgs => ({
        url: getTopWeeklyScreentimeByUniverseUrl,
        queryParams: { userId },
      }),
    }),
    getParentLinkSettings: builder.query<TParentLinkSettingsResponse, number>({
      query: (childUserId: number): TBaseQueryArgs => ({
        url: getParentLinkSettingsUrl(childUserId),
      }),
      providesTags: (_result, _error, childUserId) => [getParentLinkSettingsCacheTag(childUserId)],
    }),
    updateParentLinkSettings: builder.mutation<{}, TUpdateParentLinkSettingsRequest>({
      query: ({
        childUserId,
        settingName,
        settingValue,
      }: TUpdateParentLinkSettingsRequest): TBaseQueryArgs => ({
        url: getParentLinkSettingsUrl(childUserId),
        postBody: { settingName, settingValue },
      }),
      invalidatesTags: (_result, _error, { childUserId }) => [
        getParentLinkSettingsCacheTag(childUserId),
      ],
    }),
  }),
});

export const {
  useGetParentalConsentsQuery,
  useLazyGetParentalConsentsQuery,
  useCancelPendingConsentMutation,
  useAnswerConsentRequestMutation,
  useGetChildrenInfoQuery,
  useGetParentInfoQuery,
  useGetChildSettingsQuery,
  useGetChildSettingsV2Query,
  useGetChildFriendsQuery,
  useLazyGetChildFriendsQuery,
  useGetChildFriendsCountQuery,
  useManageChildFriendMutation,
  useRemoveChildLinkMutation,
  useInitiateConsentByParentMutation,
  useGetWeeklyScreentimeQuery,
  useGetTopWeeklyScreentimeByUniverseQuery,
  useGetParentLinkSettingsQuery,
  useUpdateParentLinkSettingsMutation,
} = parentalControlsApi;
