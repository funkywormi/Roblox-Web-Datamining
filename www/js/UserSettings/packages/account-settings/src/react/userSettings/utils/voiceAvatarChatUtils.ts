import { EnabledStatusValue, TUserSettingsAndOptionsBody } from "@rbx/user-settings";
import { TSettingsUIPolicyBody } from "../../../types/policyTypes";
import { TVoiceSettingsBody } from "../../../types/privacyTypes";

export const displayMicrophoneSetting = (
  voiceSettings: TVoiceSettingsBody | undefined,
  uiPolicy: TSettingsUIPolicyBody | undefined,
): boolean => {
  const showDataConsentToggle = uiPolicy?.showDataConsentToggle ?? false;
  // We are going to temporarily hide voice setting for users in select regions.
  const displayVoiceSettingsForUser = uiPolicy?.displayVoiceSettingsForUser ?? true;
  return (
    ((voiceSettings?.isVerifiedForVoice || voiceSettings?.isBanned) &&
      displayVoiceSettingsForUser &&
      !showDataConsentToggle) ??
    false
  );
};

export const displayDataConsentSetting = (
  settingsAndOptions: TUserSettingsAndOptionsBody | undefined,
  uiPolicy: TSettingsUIPolicyBody | undefined,
): boolean => {
  // Killswitch for voice data consent toggle visibility
  const showDataConsentToggle = uiPolicy?.showDataConsentToggle ?? false;
  // Hide voice settings if user is not allowed to use voice data, defined in AllowVoiceDataUsageDescriptor
  const displayVoiceDataConsentSettingsForUser =
    settingsAndOptions?.allowVoiceDataUsage?.currentValue === EnabledStatusValue.Enabled ||
    settingsAndOptions?.allowVoiceDataUsage?.currentValue === EnabledStatusValue.Disabled;
  return showDataConsentToggle && displayVoiceDataConsentSettingsForUser;
};

export const displayCameraSetting = (
  voiceSettings: TVoiceSettingsBody | undefined,
  uiPolicy: TSettingsUIPolicyBody | undefined,
): boolean => {
  const isAvatarVideoEligible = voiceSettings?.isAvatarVideoEligible ?? false;
  const displayAvatarVideoSetting = uiPolicy?.displayAvatarVideoSetting ?? false;
  return isAvatarVideoEligible && displayAvatarVideoSetting;
};
