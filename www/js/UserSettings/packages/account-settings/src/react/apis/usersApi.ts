import { httpService } from "core-utilities";
import {
  ChallengeAbandonedError,
  ValidateDisplayNameErrorCode,
  getUpdateDisplayNameUrl,
  getValidateDisplayNameUrl,
  validateAgedUpDisplayNameErrorCodeToStringKeys,
  validateDisplayNameErrorCodeToStringKeys,
} from "@rbx/user-settings";
import {
  TDisplayNameMeta,
  TDisplayNameParams,
  TGenderBody,
  TUserBirthdate,
} from "../../types/accountInformationTypes";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import { genderErrorCodeToStringKeys } from "../userSettings/constants/errorCodeToStringKeyMappings";
import {
  accountInformationBirthdateEndpoint,
  getGenderUrl,
} from "../userSettings/constants/urlConstants";
import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import { HttpMethod, TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { GenderErrorCode } from "../../enums/errorCodes";

export const usersApi = baseApi.injectEndpoints({
  endpoints: builder => {
    return {
      // Display name endpoints
      updateDisplayName: builder.mutation<Promise<unknown>, TDisplayNameParams>({
        query: (updateDisplayNameParams: TDisplayNameParams): TBaseQueryArgs => {
          const meta: TDisplayNameMeta = {
            showAgedUpDisplayName: updateDisplayNameParams.showAgedUpDisplayName,
          };
          return {
            url: getUpdateDisplayNameUrl(updateDisplayNameParams.userId),
            method: HttpMethod.PATCH,
            postBody: updateDisplayNameParams,
            meta,
          };
        },
        transformResponse: (response): Promise<unknown> => {
          // Force a pessimistic update as display name takes a while to settle
          // down. This effectively delays refetch of endpoints that need to be
          // refreshed after the display name is changed. It also allows us (if
          // desired) to indicate to the user the display name change is still in
          // flight.
          return new Promise(resolve => {
            setTimeout(resolve, 2000, response);
          });
        },
        transformErrorResponse: (err: unknown, meta: TDisplayNameMeta): string => {
          const errorCode = httpService.parseErrorCode(err) as ValidateDisplayNameErrorCode;
          const errorString = meta.showAgedUpDisplayName
            ? validateAgedUpDisplayNameErrorCodeToStringKeys[errorCode]
            : validateDisplayNameErrorCodeToStringKeys[errorCode];
          return errorString || commonTranslationConstants.unknownError;
        },
        invalidatesTags: [ApiCacheTag.AccountInfo],
      }),
      validateDisplayName: builder.query<void, TDisplayNameParams>({
        query: (displayNameParams: TDisplayNameParams): TBaseQueryArgs => {
          const meta: TDisplayNameMeta = {
            showAgedUpDisplayName: displayNameParams.showAgedUpDisplayName,
          };
          return {
            url: getValidateDisplayNameUrl(
              displayNameParams.userId,
              displayNameParams.newDisplayName,
            ),
            meta,
          };
        },
        transformErrorResponse: (err: unknown, meta: TDisplayNameMeta): string => {
          const errorCode = httpService.parseErrorCode(err) as ValidateDisplayNameErrorCode;
          const errorString = meta.showAgedUpDisplayName
            ? validateAgedUpDisplayNameErrorCodeToStringKeys[errorCode]
            : validateDisplayNameErrorCodeToStringKeys[errorCode];
          return errorString || commonTranslationConstants.unknownError;
        },
      }),

      // Gender endpoints
      getGender: builder.query<TGenderBody, void>({
        query: (): TBaseQueryArgs => ({
          url: getGenderUrl,
        }),
        providesTags: [ApiCacheTag.Gender],
      }),
      setGender: builder.mutation<void, TGenderBody>({
        query: (genderParams: TGenderBody): TBaseQueryArgs => ({
          url: getGenderUrl,
          postBody: genderParams,
        }),
        transformResponse: (): Promise<void> => {
          // Force a pessimistic update as gender takes a while to settle
          // down. This effectively delays refetch of endpoints that need to be
          // refreshed after the gender is changed. It also allows us (if
          // desired) to indicate to the user the gender change is still in
          // flight.
          return new Promise(resolve => {
            setTimeout(resolve, 2000);
          });
        },
        transformErrorResponse: (err: unknown): string => {
          const errorCode = httpService.parseErrorCode(err) as GenderErrorCode;
          const errorString = genderErrorCodeToStringKeys[errorCode];
          return errorString || commonTranslationConstants.unknownError;
        },
        invalidatesTags: [ApiCacheTag.Gender],
      }),

      // Birthdate endpoints
      getBirthdate: builder.query<TUserBirthdate, void>({
        query: (): TBaseQueryArgs => ({ url: accountInformationBirthdateEndpoint }),
        providesTags: [ApiCacheTag.Birthdate],
      }),
      updateBirthdate: builder.mutation<{}, TUserBirthdate>({
        query: (updateBirthdateParams): TBaseQueryArgs => ({
          url: accountInformationBirthdateEndpoint,
          postBody: updateBirthdateParams,
        }),
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
        transformErrorResponse: (err: unknown) => {
          if (err === ChallengeAbandonedError) {
            return ChallengeAbandonedError;
          }
          throw err;
        },
        invalidatesTags: [
          ApiCacheTag.Birthdate,
          ApiCacheTag.AccountInfo,
          ApiCacheTag.VerifiedAge,
          ApiCacheTag.AccountInfoAgeVerificationPolicy,
        ],
      }),
    };
  },
});

// Export hooks for usage in functional components
export const {
  useUpdateDisplayNameMutation,
  useGetGenderQuery,
  useSetGenderMutation,
  useLazyValidateDisplayNameQuery,
  useGetBirthdateQuery,
  useUpdateBirthdateMutation,
} = usersApi;
