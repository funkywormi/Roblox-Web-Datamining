import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { authenticatedUser } from "header-scripts";
import { MaybeDrafted } from "@reduxjs/toolkit/dist/query/core/buildThunks";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { grantConsentUrl, ParentalControlsErrorCode } from "@rbx/user-settings";
import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import {
  TApprovedExperience,
  TApprovedExperiencesResponse,
  TBlockedExperience,
  TBlockedExperiencesResponse,
  TBlockManagerType,
  TGetApprovedExperiencesRequest,
  TGetBlockedExperiencesRequest,
} from "../../types/privacyTypes";
import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import {
  approvedExperiencesEndpointUrl,
  blockedExperiencesEndpointUrl,
  getVerificationPageUrl,
} from "../userSettings/constants/urlConstants";
import {
  TGrantConsentRequest,
  ManagementAction,
  ParentConsentStatus,
} from "../../types/parentConsentsTypes";
import { getAllParentalConsentsCacheTags, TParentalControlsError } from "./parentalControlsApi";
import {
  approvedExperiencesPageSize,
  blockedExperiencesPageSize,
} from "../userSettings/constants/privacy/privacyConstants";

export const getBlockedExperiencesCacheTag = (userId: number): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.BlockedExperiences, id: userId };
};

export const getApprovedExperiencesCacheTag = (userId: number): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.ApprovedExperiences, id: userId };
};

export const removeBlockedExperienceFromCache = (
  draft: MaybeDrafted<TBlockedExperiencesResponse>,
  universeId: number,
): MaybeDrafted<TBlockedExperiencesResponse> => {
  if (!draft) return draft;

  return {
    ...draft,
    blockedExperiences: draft?.blockedExperiences.filter(
      experience => experience?.universeId !== universeId,
    ),
  };
};

export const removeApprovedExperienceFromCache = (
  draft: MaybeDrafted<TApprovedExperiencesResponse>,
  universeId: number,
): MaybeDrafted<TApprovedExperiencesResponse> => {
  if (!draft) return draft;

  return {
    ...draft,
    approvedExperiences: draft.approvedExperiences.filter(
      experience => experience.universeId !== universeId,
    ),
  };
};

export const experienceBlockingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBlockedExperiences: builder.query<
      TBlockedExperiencesResponse,
      TGetBlockedExperiencesRequest
    >({
      queryFn: async (
        arg: TGetBlockedExperiencesRequest,
        _api,
        _extraOptions,
        baseQuery,
      ): Promise<QueryReturnValue<TBlockedExperiencesResponse>> => {
        // Fetch all blocked experiences
        let offset = arg.offset || 0;
        let blockedExperiences: TBlockedExperience[] = [];

        const getBlockedExperiences = async (): Promise<
          QueryReturnValue<TBlockedExperiencesResponse> | undefined
        > => {
          const queryResult = (await baseQuery({
            url: blockedExperiencesEndpointUrl,
            postBody: { ...arg, offset },
            method: HttpMethod.POST,
          })) as QueryReturnValue<TBlockedExperiencesResponse>;

          const { data } = queryResult;
          blockedExperiences = [...blockedExperiences, ...(data?.blockedExperiences || [])];
          offset += blockedExperiencesPageSize;

          if (
            data?.blockedExperiences &&
            data?.blockedExperiences?.length === blockedExperiencesPageSize
          ) {
            // If we have a full page of new experiences, we know there are potentially more experiences to fetch
            return getBlockedExperiences();
          }
          // When there's no more data to fetch, exit the recursion
          return undefined;
        };

        await getBlockedExperiences();

        return {
          data: {
            blockedExperiences,
          },
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        // This gives all queries with the same childUserId the same cache key
        // So that we can merge together the data from all queries.
        return getBlockedExperiencesCacheTag(queryArgs.targetUserId ?? authenticatedUser.id);
      },
      providesTags: (result, error, body) => [
        getBlockedExperiencesCacheTag(body.targetUserId ?? authenticatedUser.id),
      ],
    }),
    manageChildBlockedExperiences: builder.mutation<void, TGrantConsentRequest>({
      query: (request: TGrantConsentRequest): TBaseQueryArgs => ({
        url: grantConsentUrl,
        postBody: request,
      }),
      async onQueryStarted(args: TGrantConsentRequest, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        const { universeId } = args.details;

        if (args.details.experienceManagementAction === ManagementAction.Unblock) {
          // Remove experience from blocked experiences cache
          dispatch(
            experienceBlockingApi.util.updateQueryData(
              "getBlockedExperiences",
              {
                targetUserId: args.childUserId,
              },
              draft => {
                if (universeId) {
                  return removeBlockedExperienceFromCache(draft, universeId);
                }
                return draft;
              },
            ),
          );
        } else if (args.details.experienceManagementAction === ManagementAction.Block) {
          // Add experience to blocked experiences cache
          if (universeId) {
            // This should always be true, but just in case
            dispatch(
              experienceBlockingApi.util.updateQueryData(
                "getBlockedExperiences",
                {
                  targetUserId: args.childUserId,
                },
                draft => {
                  draft.blockedExperiences.push({
                    universeId,
                    actorType: TBlockManagerType.Parent,
                  });
                },
              ),
            );
          }
        } else if (args.details.experienceManagementAction === ManagementAction.RevokeApproval) {
          // Remove experience from approved experiences cache
          dispatch(
            experienceBlockingApi.util.updateQueryData(
              "getApprovedExperiences",
              {
                targetUserId: args.childUserId,
              },
              draft => {
                if (universeId) {
                  return removeApprovedExperienceFromCache(draft, universeId);
                }
                return draft;
              },
            ),
          );
        }
      },
      transformErrorResponse: (err: unknown, _meta, arg): ParentalControlsErrorCode => {
        const errorCode = (err as TParentalControlsError).data.code;
        if (errorCode === ParentalControlsErrorCode.ParentNotVerified) {
          window.location.href = getVerificationPageUrl(arg.childUserId);
        }
        return errorCode;
      },
      invalidatesTags: (result, response, body) => [
        ...getAllParentalConsentsCacheTags(body.childUserId, ParentConsentStatus.Pending),
        { type: ApiCacheTag.ApprovedExperiences, id: body.childUserId },
      ],
    }),

    getApprovedExperiences: builder.query<
      TApprovedExperiencesResponse,
      TGetApprovedExperiencesRequest
    >({
      queryFn: async (
        arg: TGetApprovedExperiencesRequest,
        _api,
        _extraOptions,
        baseQuery,
      ): Promise<QueryReturnValue<TApprovedExperiencesResponse>> => {
        let offset = arg.offset || 0;
        let approvedExperiences: TApprovedExperience[] = [];

        const fetchPage = async (): Promise<
          QueryReturnValue<TApprovedExperiencesResponse> | undefined
        > => {
          const queryResult = (await baseQuery({
            url: approvedExperiencesEndpointUrl,
            postBody: { ...arg, offset },
            method: HttpMethod.POST,
          })) as QueryReturnValue<TApprovedExperiencesResponse>;

          const { data } = queryResult;
          approvedExperiences = [...approvedExperiences, ...(data?.approvedExperiences || [])];
          offset += approvedExperiencesPageSize;

          if (
            data?.approvedExperiences &&
            data.approvedExperiences.length === approvedExperiencesPageSize
          ) {
            return fetchPage();
          }
          return undefined;
        };

        await fetchPage();

        return {
          data: {
            approvedExperiences,
          },
        };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return getApprovedExperiencesCacheTag(queryArgs.targetUserId ?? authenticatedUser.id);
      },
      providesTags: (result, error, body) => [
        getApprovedExperiencesCacheTag(body.targetUserId ?? authenticatedUser.id),
      ],
    }),
  }),
});

export const {
  useGetBlockedExperiencesQuery,
  useManageChildBlockedExperiencesMutation,
  useGetApprovedExperiencesQuery,
} = experienceBlockingApi;
