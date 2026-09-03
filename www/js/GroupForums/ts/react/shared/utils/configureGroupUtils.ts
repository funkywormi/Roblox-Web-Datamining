import configureGroupConstants from '../constants/configureGroupConstants';

const getTranslationKeyForPermission = (
  permissionKey: string,
  isChannelPermission = false
): string | undefined => {
  if (isChannelPermission) {
    // Channel permissions can have their translation keys optionally overridden
    const channelTranslationKey =
      configureGroupConstants.channelRoleSettingsTranslationKey[permissionKey];
    if (channelTranslationKey) {
      return channelTranslationKey;
    }
  }
  return configureGroupConstants.roleSettingsTranslationKey[permissionKey];
};

export default { getTranslationKeyForPermission };
