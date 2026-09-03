import { httpService } from "core-utilities";
import { ChallengeAbandonedError } from "@rbx/user-settings";
import { TBaseQueryArgs, HttpMethod } from "./common/httpServiceBaseQueryFn";
import {
  authMetadataUrl,
  listCredentialsUrl,
  changeUsernameEndpoint,
  usernameChangePriceEndpoint,
  validateUsernameEndpoint,
  changePasswordUrl,
} from "../userSettings/constants/urlConstants";
import {
  TListCredentialsBody,
  TAuthMetadataBody,
  TListCredentialsParams,
  TValidateUsernameBody,
  TUpdatePasswordBody,
  TUsernameChangePriceResponse,
} from "../../types/accountInformationTypes";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";
import { ChangePasswordErrorCode, UsernameResponseErrorCode } from "../../enums/errorCodes";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import {
  changePasswordErrorCodeToStringKeys,
  usernameResponseErrorCodeToStringKeys,
} from "../userSettings/constants/errorCodeToStringKeyMappings";
import { usernameChangeContext } from "../userSettings/constants/accountInfo/accountInfoConstants";

const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // This endpoint is odd in that it's a POST request that behaves more like a GET request.
    // It may be changed in the future, but for now it'll be marked as a query thru HTTP POST.
    getRegisteredKeys: builder.query<TListCredentialsBody, TListCredentialsParams>({
      query: (listCredentialsBody: TListCredentialsParams): TBaseQueryArgs => ({
        url: listCredentialsUrl,
        method: HttpMethod.POST,
        postBody: listCredentialsBody,
      }),
    }),
    getAuthMetadata: builder.query<TAuthMetadataBody, void>({
      query: (): TBaseQueryArgs => ({ url: authMetadataUrl }),
    }),

    // Username
    getUsernameChangePrice: builder.query<TUsernameChangePriceResponse, void>({
      query: (): TBaseQueryArgs => ({ url: usernameChangePriceEndpoint }),
    }),
    updateUsername: builder.mutation<Promise<unknown>, string>({
      query: (username: string): TBaseQueryArgs => {
        return {
          url: changeUsernameEndpoint,
          postBody: { username },
        };
      },
      transformResponse: (response): Promise<unknown> => {
        // Force a pessimistic update as username takes a while to settle
        // down. This effectively delays refetch of endpoints that need to be
        // refreshed after the display name is changed. It also allows us (if
        // desired) to indicate to the user the username change is still in
        // flight.
        return new Promise(resolve => {
          setTimeout(resolve, 2000, response);
        });
      },
      transformErrorResponse: (err: unknown): string => {
        if (err === ChallengeAbandonedError) {
          return ChallengeAbandonedError;
        }
        const errorCode = httpService.parseErrorCode(err) as UsernameResponseErrorCode;
        return (
          usernameResponseErrorCodeToStringKeys[errorCode] ||
          commonTranslationConstants.unknownError
        );
      },
      invalidatesTags: [ApiCacheTag.AccountInfo],
    }),
    validateUsername: builder.mutation<TValidateUsernameBody, string>({
      query: (username: string): TBaseQueryArgs => {
        return {
          url: validateUsernameEndpoint,
          postBody: { username, context: usernameChangeContext },
        };
      },
      transformErrorResponse: (err: unknown): string => {
        const errorCode = httpService.parseErrorCode(err) as UsernameResponseErrorCode;
        return (
          usernameResponseErrorCodeToStringKeys[errorCode] ||
          commonTranslationConstants.unknownError
        );
      },
    }),

    // Password
    changePassword: builder.mutation<void, TUpdatePasswordBody>({
      query: (updatePasswordBody: TUpdatePasswordBody): TBaseQueryArgs => ({
        url: changePasswordUrl,
        postBody: updatePasswordBody,
        withCredentials: true,
      }),
      transformErrorResponse: (err: unknown): any => {
        if (err === ChallengeAbandonedError) {
          return ChallengeAbandonedError;
        }
        const errorCode = httpService.parseErrorCode(err) as ChangePasswordErrorCode;
        return (
          changePasswordErrorCodeToStringKeys[errorCode] || commonTranslationConstants.unknownError
        );
      },
    }),
  }),
});

export const {
  useGetRegisteredKeysQuery,
  useGetAuthMetadataQuery,
  useGetUsernameChangePriceQuery,
  useUpdateUsernameMutation,
  useValidateUsernameMutation,
  useChangePasswordMutation,
} = authApi;
