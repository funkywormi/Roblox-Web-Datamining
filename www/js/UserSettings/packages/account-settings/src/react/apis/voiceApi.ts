import { TBaseQueryArgs } from "./common/httpServiceBaseQueryFn";
import ApiCacheTag from "./common/cacheTagEnum";
import baseApi from "./common/baseApi";
import {
  getVoiceSettingsUrl,
  updateAvatarVideoEnabledUrl,
  updateVoiceChatEnabledUrl,
  updateAllowVoiceDataUsageEnabledUrl,
} from "../userSettings/constants/urlConstants";
import { TVoiceSettingsBody } from "../../types/privacyTypes";

const voiceApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getVoiceSettings: builder.query<TVoiceSettingsBody, void>({
      query: (): TBaseQueryArgs => ({ url: getVoiceSettingsUrl }),
      providesTags: [ApiCacheTag.VoiceSettings],
    }),
    updateVoiceChatEnabledSetting: builder.mutation<void, boolean>({
      query: (isUserOptIn: boolean): TBaseQueryArgs => {
        return {
          url: updateVoiceChatEnabledUrl,
          postBody: { isUserOptIn },
        };
      },
      invalidatesTags: [ApiCacheTag.VoiceSettings],
    }),
    updateAvatarVideoEnabledSetting: builder.mutation<void, boolean>({
      query: (isUserOptIn: boolean): TBaseQueryArgs => {
        return {
          url: updateAvatarVideoEnabledUrl,
          postBody: { isUserOptIn },
        };
      },
      invalidatesTags: [ApiCacheTag.VoiceSettings],
    }),
    updateAllowDataUsageEnabledSetting: builder.mutation<void, boolean>({
      query: (allowVoiceDataUsage: boolean): TBaseQueryArgs => {
        return {
          url: updateAllowVoiceDataUsageEnabledUrl,
          postBody: { allowVoiceDataUsage },
        };
      },
      invalidatesTags: [ApiCacheTag.VoiceSettings],
    }),
  }),
});

export const {
  useGetVoiceSettingsQuery,
  useUpdateVoiceChatEnabledSettingMutation,
  useUpdateAvatarVideoEnabledSettingMutation,
  useUpdateAllowDataUsageEnabledSettingMutation,
} = voiceApi;
