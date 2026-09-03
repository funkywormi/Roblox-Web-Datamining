import UserSetting from '../../../../legallySensitiveContent/enums/UserSetting';
import ConsentName from '../../../../legallySensitiveContent/enums/ConsentName';

const settingNameToConsentName: Record<string, ConsentName> = {
  phoneNumberDiscoverabilityV2: ConsentName.phoneNumberDiscoverabilityUpsell
};

export const getConsentNameForSetting = (settingName: string): ConsentName | undefined => {
  return settingNameToConsentName[settingName];
};

export const getSettingNameForSetting = (settingName: UserSetting): UserSetting => {
  switch (settingName) {
    case UserSetting.phoneNumberDiscoverabilityV2:
      // AMP returns setting names from the user-settings proto definition, but our API expects the legacy setting name format
      // This mapping converts the proto setting name to the correct format for the update API call
      return UserSetting.phoneNumberDiscoverability;
    default:
      return settingName;
  }
};

export default settingNameToConsentName;
