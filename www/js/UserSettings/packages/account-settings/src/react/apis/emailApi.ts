import { httpService } from "core-utilities";
import { ChallengeAbandonedError } from "@rbx/user-settings";
import baseApi from "./common/baseApi";
import { EmailErrorCode } from "../../enums/errorCodes";
import commonTranslationConstants from "../userSettings/constants/contentConstants/commonTranslationConstants";
import { accountSettingsEmailErrorCodeToStringKeys } from "../userSettings/constants/errorCodeToStringKeyMappings";
import { getOrUpdateEmailUrl, sendVerifyEmailUrl } from "../userSettings/constants/urlConstants";
import ApiCacheTag from "./common/cacheTagEnum";
import { TUpdateEmailBody } from "../../types/accountInformationTypes";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";

const emailApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    sendVerificationEmail: builder.mutation<void, void>({
      query: () => ({
        url: sendVerifyEmailUrl,
      }),
      transformErrorResponse: (err: unknown): string => {
        const errorCode = httpService.parseErrorCode(err) as EmailErrorCode;
        return (
          accountSettingsEmailErrorCodeToStringKeys[errorCode] ||
          commonTranslationConstants.unknownError
        );
      },
    }),
    setEmailAddress: builder.mutation<Promise<unknown>, TUpdateEmailBody>({
      query: (updateEmailBody: TUpdateEmailBody): TBaseQueryArgs => ({
        url: getOrUpdateEmailUrl,
        postBody: updateEmailBody,
      }),
      transformResponse: (response): Promise<unknown> => {
        // Force a pessimistic update as email takes a while to settle
        // down. This effectively delays refetch of endpoints that need to be
        // refreshed after the email is changed. It also allows us (if
        // desired) to indicate to the user the email change is still in
        // flight.
        return new Promise(resolve => {
          setTimeout(resolve, 1000, response);
        });
      },
      transformErrorResponse: (err: unknown): string => {
        if (err === ChallengeAbandonedError) {
          return ChallengeAbandonedError;
        }
        const errorCode = httpService.parseErrorCode(err) as EmailErrorCode;
        return (
          accountSettingsEmailErrorCodeToStringKeys[errorCode] ||
          commonTranslationConstants.unknownError
        );
      },
      invalidatesTags: [ApiCacheTag.AccountInfo],
    }),
  }),
});

export const { useSendVerificationEmailMutation, useSetEmailAddressMutation } = emailApi;
