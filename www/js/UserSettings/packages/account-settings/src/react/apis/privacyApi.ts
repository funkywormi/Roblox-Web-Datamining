import { ChallengeAbandonedError } from "@rbx/user-settings";
import baseApi from "./common/baseApi";
import { TForgetUserRequest } from "../../types/accountInformationTypes";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { getForgetUserUrl, getRequestDataUrl } from "../userSettings/constants/urlConstants";

export type TDataRequestUserRequest = {
  userId: number;
};

const privacyApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    forgetUser: builder.mutation<Promise<unknown>, TForgetUserRequest>({
      query: (request: TForgetUserRequest): TBaseQueryArgs => ({
        url: getForgetUserUrl(request.userId),
      }),
      transformErrorResponse: (err: unknown): unknown => {
        if (err === ChallengeAbandonedError) {
          return ChallengeAbandonedError;
        }
        return err;
      },
    }),
    requestUserData: builder.mutation<Promise<unknown>, TDataRequestUserRequest>({
      query: (request: TDataRequestUserRequest): TBaseQueryArgs => ({
        url: getRequestDataUrl(request.userId),
      }),
    }),
  }),
});

export const { useForgetUserMutation, useRequestUserDataMutation } = privacyApi;
