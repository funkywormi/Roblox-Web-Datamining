export enum UserSetting {
  doNotDisturbTimeWindow = 'doNotDisturbTimeWindow',
  doNotDisturb = 'doNotDisturb',
  allowMarketingEmailNotifications = 'allowMarketingEmailNotifications'
}

export enum UserSettingName {
  doNotDisturbTimeWindow = 'doNotDisturbTimeWindow'
}
export type TOptionValue = EnabledStatusValue | TDoNotDisturbTimeWindow | TChannelSettingsValue;

export type TUpdateUserSettingValueRequest = {
  [key in UserSetting]?: TOptionValue;
};

export type UpdateUserSettingsCallback = (
  setting: UserSetting | null,
  userSettingName: string | null,
  value: TOptionValue,
  auditHeader?: string
) => void;

export type TDoNotDisturbTimeWindow = {
  startTimeMinutes: number;
  endTimeMinutes: number;
};

export type TUserSettingsBody = {
  [UserSetting.doNotDisturbTimeWindow]?: TDoNotDisturbTimeWindow;
  [UserSetting.doNotDisturb]?: EnabledStatusValue;
};

export enum EnabledStatusValue {
  Invalid = 'Invalid',
  Enabled = 'Enabled',
  Disabled = 'Disabled'
}

export type TChannelSetting = {
  channelName: string;
  setting: string;
};

export type TChannelSettingsValue = {
  channelSettings: Array<TChannelSetting>;
};
