import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityLevelMap } from "../constants/types";
import * as TwoStepVerificationApiTypes from "../../../common/request/types/twoStepVerification";

export const debounce = <T extends Array<unknown>>(
  func: (...args: T) => Promise<void> | void,
  timeout = 300,
): [(...args: T) => void, () => void] => {
  let timer: ReturnType<typeof setTimeout>;
  return [
    (...args: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          // Ignore debounced function errors since we handle them upstream in business logic
          // eslint-disable-next-line no-void
          void func.apply(this, args);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }, timeout);
    },
    () => {
      clearTimeout(timer);
    },
  ];
};

/**
 * Processes user configuration and returns filtered enabled media types.
 * When isSingleMethodEnforcementEnabled is true, only methods at the highest
 * security level are returned (e.g., if Authenticator level 3 and Email level 2
 * are both enabled, only Authenticator is returned).
 */
export const getFilteredEnabledMediaTypes = (
  configuration: TwoStepVerificationApiTypes.GetUserConfigurationReturnType,
  isSingleMethodEnforcementEnabled: boolean,
): string[] => {
  const enabledMediaTypesWithSecurityLevelDefined = configuration.methods
    .filter(method => method.enabled && Object.keys(MediaType).includes(method.mediaType))
    .map(method => method.mediaType);

  if (!isSingleMethodEnforcementEnabled) {
    return enabledMediaTypesWithSecurityLevelDefined;
  }

  const highestSecurityLevelEnabled = enabledMediaTypesWithSecurityLevelDefined
    .map(mediaType => SecurityLevelMap[mediaType as MediaType])
    .reduce((acc, next) => (acc > next ? acc : next), 0);

  return enabledMediaTypesWithSecurityLevelDefined.filter(
    mediaType => SecurityLevelMap[mediaType as MediaType] >= highestSecurityLevelEnabled,
  );
};

export default {
  debounce,
  getFilteredEnabledMediaTypes,
};
