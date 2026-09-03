import { EnvironmentUrls } from "Roblox";
import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import { TGetVerifiedAgeBody } from "../../types/accountInformationTypes";
import {
  acceptPendingDownageEndpointUrl,
  getUndoAgeVerificationEligibilityEndpointUrl,
  undoAgeVerificationEndpointUrl,
} from "../userSettings/constants/urlConstants";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";

const { apiGatewayUrl } = EnvironmentUrls;

const getVerifiedAgeUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/age-verification/verified-age`,
});

export const ageVerificationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getVerifiedAge: builder.query<TGetVerifiedAgeBody, void>({
      query: (): TBaseQueryArgs => getVerifiedAgeUrlConfig(),
      providesTags: [ApiCacheTag.VerifiedAge],
    }),
    getUndoAgeVerificationEligibility: builder.query<boolean, void>({
      query: (): TBaseQueryArgs => ({
        withCredentials: true,
        url: getUndoAgeVerificationEligibilityEndpointUrl,
      }),
      providesTags: [ApiCacheTag.UndoAgeVerificationEligibility],
    }),
    undoAgeVerification: builder.mutation<void, void>({
      query: (): TBaseQueryArgs => ({
        withCredentials: true,
        url: undoAgeVerificationEndpointUrl,
      }),
      invalidatesTags: [ApiCacheTag.UndoAgeVerificationEligibility],
    }),
    acceptPendingDownage: builder.mutation<boolean, void>({
      query: (): TBaseQueryArgs => ({
        withCredentials: true,
        url: acceptPendingDownageEndpointUrl,
      }),
    }),
  }),
});

export const {
  useGetVerifiedAgeQuery,
  useGetUndoAgeVerificationEligibilityQuery,
  useUndoAgeVerificationMutation,
  useAcceptPendingDownageMutation,
} = ageVerificationApi;
