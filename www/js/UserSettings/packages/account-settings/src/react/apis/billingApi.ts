import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import {
  TGetParentalSpendControlsBody,
  TParentalSpendControlsSettings,
  getParentalSpendControlsUrl,
  SpendNotificationSetting,
} from "@rbx/user-settings";
import baseApi from "./common/baseApi";
import parentalControlsConstants from "../userSettings/constants/parentalControls/parentalControlsConstants";
import ApiCacheTag from "./common/cacheTagEnum";

export const getChildSpendControlsSettingsCacheTag = (
  childUserId: number,
): FullTagDescription<ApiCacheTag> => {
  return { type: ApiCacheTag.SpendControls, id: childUserId };
};

const billingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getParentalSpendControls: builder.query<TParentalSpendControlsSettings, number>({
      query: userId => ({
        url: getParentalSpendControlsUrl,
        queryParams: { userId },
      }),
      transformResponse(result: TGetParentalSpendControlsBody): TParentalSpendControlsSettings {
        const parentalSpendControls: TParentalSpendControlsSettings = {
          monthlySpendLimit: result?.monthlySpendLimit,
          monthlySpendLimitCurrencyType:
            result?.monthlySpendLimitCurrencyType ||
            parentalControlsConstants.spendControls.defaultCurrencyCode,
          monthlyLimitEnabled:
            result?.monthlySpendLimit != null && result?.monthlySpendLimit !== undefined,
          monthlyLimitVisible: result?.isMonthlySpendLimitSettingEnabledForUser || false,
          spendNotificationSetting:
            result?.spendNotificationSetting || SpendNotificationSetting.Default,
          notificationSettingEnabled:
            result?.spendNotificationSetting !== SpendNotificationSetting.NotificationsOff,
          notificationSettingVisible: result?.isSpendNotificationSettingEnabledForUser || false,
          maxMonthlySpendLimit:
            result?.maxMonthlySpendLimit ||
            parentalControlsConstants.spendControls.defaultMaxMonthlySpendLimit,
          parentalSpendControlsCutOffAge:
            result?.parentalSpendControlsCutOffAge ||
            parentalControlsConstants.spendControls.defaultCutoffAge,
          canUserDisableMonthlySpendLimit: result?.canUserDisableMonthlySpendLimit ?? true,
        };
        return parentalSpendControls;
      },
      providesTags: (result, error, request) => [getChildSpendControlsSettingsCacheTag(request)],
    }),
  }),
});

export const { useGetParentalSpendControlsQuery } = billingApi;
