import { CredentialType } from '../types/loginTypes';
import EVENT_CONSTANTS from '../constants/eventsConstants';
import { sendAuthPageLoadEvent } from '../../reactLogin/services/eventService';
import passkeySessionStorageKeys from '../constants/passkeyUpgradeConstants';

// IXP variant for the silent-passkey-upgrade experiment. Any unrecognized
// runtime value (e.g. a missing IXP parameter that was cast at the read site)
// is treated the same as `NotEnrolled` to fail safe.
export enum SilentPasskeyUpgradeVariant {
  NotEnrolled = 0,
  // Enrolled, but only proceed if the browser has conditional-create support.
  WithBrowserCheck = 1,
  // Enrolled, skip the conditional-create capability check.
  SkipBrowserCheck = 2
}

export type SetPasskeyUpgradeFlagCoreParams = {
  credentialType: CredentialType;
  sourceCtx: string;
  upgradeType: string;
  upgradeCtx: string;
  isPasskeyLoginSupported: boolean;
  isConditionalCreateSupported: boolean;
  silentUpgradeBrowserCheck: SilentPasskeyUpgradeVariant;
  userId: string;
};

/**
 * Shared core for the silent-passkey-upgrade producer. Runs the gate stack
 * (credential allowlist, IXP enrollment, capability checks) with filtering
 * telemetry, then writes the session-storage flag + userId on success.
 * Flow-specific wrappers supply `sourceCtx`, `upgradeType`, and `upgradeCtx`.
 */
export const attemptSetPasskeyUpgradeFlagCore = ({
  credentialType,
  sourceCtx,
  upgradeType,
  upgradeCtx,
  isPasskeyLoginSupported,
  isConditionalCreateSupported,
  silentUpgradeBrowserCheck,
  userId
}: SetPasskeyUpgradeFlagCoreParams): void => {
  // Only attempt passkey upgrade for Username, Email, and PhoneNumber
  // credentials. This prevents accidentally upgrading any new credential
  // types added in the future.
  if (
    credentialType !== CredentialType.Username &&
    credentialType !== CredentialType.Email &&
    credentialType !== CredentialType.PhoneNumber
  ) {
    return;
  }

  if (!silentUpgradeBrowserCheck) {
    return;
  }

  if (!isPasskeyLoginSupported) {
    sendAuthPageLoadEvent(
      sourceCtx,
      EVENT_CONSTANTS.state.passkeyUpselling.filteredByNoPasskeySupport
    );
    return;
  }

  if (
    silentUpgradeBrowserCheck === SilentPasskeyUpgradeVariant.WithBrowserCheck &&
    !isConditionalCreateSupported
  ) {
    sendAuthPageLoadEvent(
      sourceCtx,
      EVENT_CONSTANTS.state.passkeyUpselling.filteredByNoSilentUpgradeSupport
    );
    return;
  }

  if (sessionStorage.getItem(passkeySessionStorageKeys.upgradeKey) !== null) {
    sendAuthPageLoadEvent(
      sourceCtx,
      EVENT_CONSTANTS.state.passkeyUpselling.unclearedWebSessionFlag
    );
  }

  sessionStorage.setItem(passkeySessionStorageKeys.upgradeKey, upgradeType);
  if (userId) {
    sessionStorage.setItem(passkeySessionStorageKeys.upgradeUserIdKey, userId);
  } else {
    sessionStorage.removeItem(passkeySessionStorageKeys.upgradeUserIdKey);
  }
  sendAuthPageLoadEvent(upgradeCtx, `set${upgradeType}`);
};
