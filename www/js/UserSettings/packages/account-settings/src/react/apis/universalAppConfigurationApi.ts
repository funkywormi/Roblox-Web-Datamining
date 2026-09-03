import { Guac } from "Roblox";
import baseApi from "./common/baseApi";
import ApiCacheTag from "./common/cacheTagEnum";
import {
  TAbuseReportRevampPolicyBody,
  TDisplayNamesPolicyBody,
  TFreeCommunicationInfographicPolicyBody,
  TPrivateMessagesPolicyBody,
  TSettingsUIPolicyBody,
  TVpcLaunchStatusBody,
  TAccountInfoAgeVerificationPolicyBody,
  TSettingsUIRequest,
  TAccountInfoAgeVerificationRequest,
} from "../../types/policyTypes";

export const univeralAppConfigurationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSettingsUiPolicy: builder.query<TSettingsUIPolicyBody, TSettingsUIRequest | void>({
      queryFn: async (settingsRequest: TSettingsUIRequest | void) => {
        try {
          // Guac caches with browser cache headers based on url, so we need to pass a dummy param to change the url and bust the cache
          const params = new URLSearchParams();
          if (settingsRequest && settingsRequest.bustCache) {
            params.append("cacheBuster", `${Date.now()}`);
          }

          const data = await Guac.callBehaviour<TSettingsUIPolicyBody>(
            "account-settings-ui",
            params,
          );
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
    }),
    getPrivateMessagesPolicy: builder.query<TPrivateMessagesPolicyBody, void>({
      queryFn: async () => {
        try {
          const data = await Guac.callBehaviour<TPrivateMessagesPolicyBody>("private-messages-ui");
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
    }),
    getFreeCommunicationInfographicPolicy: builder.query<
      TFreeCommunicationInfographicPolicyBody,
      void
    >({
      queryFn: async () => {
        try {
          const data = await Guac.callBehaviour<TFreeCommunicationInfographicPolicyBody>(
            "free-communication-infographics",
          );
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
    }),
    getDisplayNamesPolicy: builder.query<TDisplayNamesPolicyBody, void>({
      queryFn: async () => {
        try {
          const data = await Guac.callBehaviour<TDisplayNamesPolicyBody>("display-names");
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
    }),
    getAbuseReportRevampPolicy: builder.query<TAbuseReportRevampPolicyBody, void>({
      queryFn: async () => {
        try {
          const data =
            await Guac.callBehaviour<TAbuseReportRevampPolicyBody>("abuse-reporting-revamp");
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: String(error) } };
        }
      },
    }),
    getVPCLaunchStatus: builder.query<TVpcLaunchStatusBody, void>({
      queryFn: async () => {
        try {
          const data = await Guac.callBehaviour<TVpcLaunchStatusBody>("vpc-launch-status");
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
    }),
    getAccountInfoAgeVerificationPolicy: builder.query<
      TAccountInfoAgeVerificationPolicyBody,
      TAccountInfoAgeVerificationRequest | void
    >({
      queryFn: async (ageVerificationRequest: TAccountInfoAgeVerificationRequest | void) => {
        try {
          const params = new URLSearchParams();
          if (ageVerificationRequest && ageVerificationRequest.bustCache) {
            params.append("cacheBuster", `${Date.now()}`);
          }
          const data = await Guac.callBehaviour<TAccountInfoAgeVerificationPolicyBody>(
            "account-info-age-verification",
            params,
          );
          return { data };
        } catch (error) {
          return { error: { status: "FETCH_ERROR", error: JSON.stringify(error) } };
        }
      },
      providesTags: [ApiCacheTag.AccountInfoAgeVerificationPolicy],
    }),
  }),
});

export const {
  useGetSettingsUiPolicyQuery,
  useGetPrivateMessagesPolicyQuery,
  useGetFreeCommunicationInfographicPolicyQuery,
  useGetDisplayNamesPolicyQuery,
  useGetAbuseReportRevampPolicyQuery,
  useGetVPCLaunchStatusQuery,
  useGetAccountInfoAgeVerificationPolicyQuery,
} = univeralAppConfigurationApi;
