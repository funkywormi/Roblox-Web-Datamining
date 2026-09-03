import {
  defaultCurrencyCode,
  defaultCutoffAge,
  defaultMaxMonthlySpendLimit,
} from "../constants/parentalSpendControlsConstants";
import { SpendNotificationSetting } from "../enums/userSettingsEnums";
import {
  TGetParentalSpendControlsBody,
  TParentalSpendControlsSettings,
} from "../types/parentalSpendControlsTypes";

export const convertSpendControlsBodyToParentalSpendControlsSettings = (
  body: TGetParentalSpendControlsBody | undefined,
): TParentalSpendControlsSettings => {
  const parentalSpendControls: TParentalSpendControlsSettings = {
    monthlySpendLimit: body?.monthlySpendLimit,
    monthlySpendLimitCurrencyType: body?.monthlySpendLimitCurrencyType ?? defaultCurrencyCode,
    monthlyLimitEnabled: body?.monthlySpendLimit != null,
    monthlyLimitVisible: body?.isMonthlySpendLimitSettingEnabledForUser ?? false,
    spendNotificationSetting: body?.spendNotificationSetting ?? SpendNotificationSetting.Default,
    notificationSettingEnabled:
      body?.spendNotificationSetting !== SpendNotificationSetting.NotificationsOff,
    notificationSettingVisible: body?.isSpendNotificationSettingEnabledForUser ?? false,
    maxMonthlySpendLimit: body?.maxMonthlySpendLimit ?? defaultMaxMonthlySpendLimit,
    parentalSpendControlsCutOffAge: body?.parentalSpendControlsCutOffAge ?? defaultCutoffAge,
    canUserDisableMonthlySpendLimit: body?.canUserDisableMonthlySpendLimit ?? true,
  };
  return parentalSpendControls;
};

export const isMonthlyLimitOutOfRange = (
  limit: number | null | undefined,
  spendControlSettings: TParentalSpendControlsSettings | undefined,
): boolean => {
  const maxLimit = spendControlSettings?.maxMonthlySpendLimit ?? defaultMaxMonthlySpendLimit;

  if (limit !== null && limit !== undefined && (limit < 0 || limit > maxLimit)) {
    return true;
  }
  return false;
};
