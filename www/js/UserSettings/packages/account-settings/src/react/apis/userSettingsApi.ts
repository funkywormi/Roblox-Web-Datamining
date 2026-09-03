import { httpService, urlService } from "core-utilities";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import { MaybePromise } from "@reduxjs/toolkit/dist/query/tsHelpers";
import { authenticatedUser } from "header-scripts";
import {
  ChallengeAbandonedError,
  UserSettingsServiceErrorCode,
  userSettingsServiceErrorCodeToStringKeys,
  userSettingsAndOptionsUrl,
  userSettingsAndOptionsV2Url,
  userSettingsMetadataUrl,
  userSettingsUrl,
  grantConsentUrl,
  userSettingsV2Url,
  TUpdateUserSettingValueResponseBody,
  TUserSettingsAndOptionsBody,
  TUserSettingsAndOptionsV2Body,
  TUserSettingsBody,
  TUserSettingsMetadataBody,
  TUserSettingsRequestBody,
  TUpdateUserSettingValueRequest,
} from "@rbx/user-settings";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import {
  TUpdateSettingConsentRequirementsPayload,
  TUpdateSettingConsentRequirementsV2Payload,
  requestSettingUpdate,
  updateSettingConsentRequirementsState,
  updateSettingConsentRequirementsV2State,
} from "./slices/parentalConsentSlice";
import { getAllParentalConsentsCacheTags, getChildSettingsCacheTag } from "./parentalControlsApi";
import {
  ParentConsentStatus,
  ParentConsentType,
  TConsentData,
} from "../../types/parentConsentsTypes";
import { getChildSpendControlsSettingsCacheTag } from "./billingApi";

// helper function to transform error responses from user settings api.
const translateErrorResponse = (err: unknown): string => {
  if (err === ChallengeAbandonedError) {
    return ChallengeAbandonedError;
  }
  const errorCode = httpService.parseErrorCode(err) as UserSettingsServiceErrorCode;
  return (
    userSettingsServiceErrorCodeToStringKeys[errorCode] || commonTranslationConstants.unknownError
  );
};

const userSettingsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSettingsMetadata: builder.query<TUserSettingsMetadataBody, void>({
      query: (): TBaseQueryArgs => ({ url: userSettingsMetadataUrl }),
      transformErrorResponse: translateErrorResponse,
    }),
    getUserSettings: builder.query<TUserSettingsBody, string | void>({
      query: (requestedUserSettings?: string): TBaseQueryArgs => {
        let url = userSettingsUrl;
        if (requestedUserSettings) {
          const userSettingsRequest: TUserSettingsRequestBody = {
            requestedUserSettings,
          };
          url = urlService.getUrlWithQueries(userSettingsUrl, userSettingsRequest);
        }
        return {
          url,
          withCredentials: true,
        };
      },
      transformErrorResponse: translateErrorResponse,
      providesTags: [ApiCacheTag.UserSettings],
    }),
    updateUserSettingValue: builder.mutation<
      TUpdateUserSettingValueResponseBody,
      TUpdateUserSettingValueRequest
    >({
      queryFn: async (arg: TUpdateUserSettingValueRequest, api, _extraOptions, baseQuery) => {
        type TBaseQueryReturnType = MaybePromise<
          QueryReturnValue<TUpdateUserSettingValueResponseBody, unknown, {}>
        >;

        // Update child setting, if child user id is provided.
        if (arg.childUserId) {
          const details: TConsentData = { [arg.setting]: arg.value };
          return baseQuery({
            url: grantConsentUrl,
            postBody: {
              childUserId: arg.childUserId,
              consentType: ParentConsentType.UpdateUserSetting,
              details,
            },
            headers: {
              ...(arg.auditHeader && { "rbx-audit-data": arg.auditHeader }),
            },
          }) as TBaseQueryReturnType;
        }

        const { dispatch } = api;
        // call back to update the setting directly if consent is not required.
        const updateSettingFn = (): TBaseQueryReturnType => {
          return baseQuery({
            url: userSettingsUrl,
            postBody: { [arg.setting]: arg.value },
            headers: {
              ...(arg.auditHeader && { "rbx-audit-data": arg.auditHeader }),
            },
          }) as TBaseQueryReturnType;
        };

        const consentUpdateAction = requestSettingUpdate({
          body: arg,
          settingUpdateBlockedCallback: () => {
            return {
              data: { settingUpdateBlocked: true } as TUpdateUserSettingValueResponseBody,
            } as TBaseQueryReturnType;
          },
          consentSkippedCallback: updateSettingFn,
          usePrologue: arg.usePrologue ?? false,
          useRequirementsMapV2: arg.useRequirementsMapV2 ?? false,
        });

        try {
          const dispatchResult = (await (dispatch(
            consentUpdateAction,
          ) as unknown)) as Promise<TBaseQueryReturnType>;
          return await dispatchResult;
        } catch (err) {
          return { error: translateErrorResponse(err) } as TBaseQueryReturnType;
        }
      },
      invalidatesTags: (result, response, body) => {
        if (body.childUserId) {
          return [
            ...getAllParentalConsentsCacheTags(body.childUserId, ParentConsentStatus.Pending),
            getChildSettingsCacheTag(body.childUserId),
            getChildSpendControlsSettingsCacheTag(body.childUserId),
          ];
        }
        return [
          ApiCacheTag.UserSettings,
          ApiCacheTag.Phone,
          ApiCacheTag.UserSettingsAndOptions,
          ...getAllParentalConsentsCacheTags(authenticatedUser.id!, ParentConsentStatus.Pending),
        ];
      },
    }),
    getUserSettingsAndOptions: builder.query<TUserSettingsAndOptionsBody, string | void>({
      query: (requestedUserSettings?: string): TBaseQueryArgs => {
        let url = userSettingsAndOptionsUrl;
        if (requestedUserSettings) {
          const userSettingsRequest: TUserSettingsRequestBody = {
            requestedUserSettings,
          };
          url = urlService.getUrlWithQueries(userSettingsAndOptionsUrl, userSettingsRequest);
        }
        return {
          url,
          withCredentials: true,
        };
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const body: TUpdateSettingConsentRequirementsPayload = {
            userId: authenticatedUser.id!,
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
      transformErrorResponse: translateErrorResponse,
      providesTags: [ApiCacheTag.UserSettingsAndOptions],
    }),
    getUserSettingsAndOptionsV2: builder.query<TUserSettingsAndOptionsV2Body, string | void>({
      query: (requestedUserSettings?: string): TBaseQueryArgs => {
        let url = userSettingsAndOptionsV2Url;
        if (requestedUserSettings) {
          const userSettingsRequest: TUserSettingsRequestBody = {
            requestedUserSettings,
          };
          url = urlService.getUrlWithQueries(userSettingsAndOptionsV2Url, userSettingsRequest);
        }
        return {
          url,
          withCredentials: true,
        };
      },
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const body: TUpdateSettingConsentRequirementsV2Payload = {
            userId: authenticatedUser.id!,
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
      transformErrorResponse: translateErrorResponse,
      providesTags: [ApiCacheTag.UserSettingsAndOptions],
    }),
    updateUserSettingValueV2: builder.mutation<
      TUpdateUserSettingValueResponseBody,
      TUpdateUserSettingValueRequest
    >({
      queryFn: async (arg: TUpdateUserSettingValueRequest, api, _extraOptions, baseQuery) => {
        type TBaseQueryReturnType = MaybePromise<
          QueryReturnValue<TUpdateUserSettingValueResponseBody, unknown, {}>
        >;

        // Update child setting, if child user id is provided.
        if (arg.childUserId) {
          const details: TConsentData = { [arg.setting]: arg.value };
          return baseQuery({
            url: grantConsentUrl,
            postBody: {
              childUserId: arg.childUserId,
              consentType: ParentConsentType.UpdateUserSetting,
              details,
            },
            headers: {
              ...(arg.auditHeader && { "rbx-audit-data": arg.auditHeader }),
            },
          }) as TBaseQueryReturnType;
        }

        const { dispatch } = api;
        // call back to update the setting directly if consent is not required.
        const updateSettingFn = (): TBaseQueryReturnType => {
          return baseQuery({
            url: userSettingsV2Url,
            postBody: { [arg.setting]: arg.value },
            headers: {
              ...(arg.auditHeader && { "rbx-audit-data": arg.auditHeader }),
            },
          }) as TBaseQueryReturnType;
        };

        const consentUpdateAction = requestSettingUpdate({
          body: arg,
          settingUpdateBlockedCallback: () => {
            return {
              data: { settingUpdateBlocked: true } as TUpdateUserSettingValueResponseBody,
            } as TBaseQueryReturnType;
          },
          consentSkippedCallback: updateSettingFn,
          usePrologue: arg.usePrologue ?? false,
          useRequirementsMapV2: arg.useRequirementsMapV2 ?? false,
        });

        try {
          const dispatchResult = (await (dispatch(
            consentUpdateAction,
          ) as unknown)) as Promise<TBaseQueryReturnType>;
          return await dispatchResult;
        } catch (err) {
          return { error: translateErrorResponse(err) } as TBaseQueryReturnType;
        }
      },
      invalidatesTags: (result, response, body) => {
        if (body.childUserId) {
          return [
            ...getAllParentalConsentsCacheTags(body.childUserId, ParentConsentStatus.Pending),
            getChildSettingsCacheTag(body.childUserId),
            getChildSpendControlsSettingsCacheTag(body.childUserId),
          ];
        }
        return [
          ApiCacheTag.UserSettings,
          ApiCacheTag.Phone,
          ApiCacheTag.UserSettingsAndOptions,
          ...getAllParentalConsentsCacheTags(authenticatedUser.id!, ParentConsentStatus.Pending),
        ];
      },
    }),
  }),
});

export const {
  useGetSettingsMetadataQuery,
  useGetUserSettingsQuery,
  useUpdateUserSettingValueMutation,
  useGetUserSettingsAndOptionsQuery,
  useGetUserSettingsAndOptionsV2Query,
  useUpdateUserSettingValueV2Mutation,
  endpoints: { getUserSettingsAndOptionsV2 },
} = userSettingsApi;
