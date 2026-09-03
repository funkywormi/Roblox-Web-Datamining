import { useState, useEffect } from "react";
import { DeviceMeta } from "Roblox";
import { hybridResponseService } from "core-roblox-utilities";

export interface PlatformSupportMetadata {
  isAndroidSecurityKeyEnabled: boolean;
}

/**
 * Check if FIDO2 is supported via hybrid API (native iOS/Android apps)
 */
const isFido2SupportedViaHybridApi = async (): Promise<boolean> => {
  const isInApp = DeviceMeta && DeviceMeta().isInApp;
  const isInIosOrAndroidApp =
    isInApp && DeviceMeta && (DeviceMeta().isIosApp || DeviceMeta().isAndroidApp);

  if (isInIosOrAndroidApp) {
    // This checks if the native implementation of security keys or passkeys exists
    // Currently only returns true for a subset of iOS devices.
    try {
      const isAvailable = await hybridResponseService.getNativeResponse(
        hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
        {},
        2000,
      );
      return isAvailable === "true";
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * Check if FIDO2 is supported via browser API (web browsers)
 */
const isFido2SupportedViaBrowserApi = (): boolean => {
  const isInApp = DeviceMeta && DeviceMeta().isInApp;
  if (isInApp || typeof PublicKeyCredential === "undefined") {
    return false;
  }
  return true;
};

/**
 * Get platform support based on browser/hybrid API checks and metadata flags
 */
const getPlatformSupport = async (
  metadata: PlatformSupportMetadata,
): Promise<{
  platformSupportsPasskey: boolean;
  platformSupportsSecurityKey: boolean;
}> => {
  const browserApiSupported = isFido2SupportedViaBrowserApi();
  const hybridApiSupported = await isFido2SupportedViaHybridApi();

  // Determine if platform supports passkey/security key (matching production logic)
  const platformSupportsPasskey = hybridApiSupported || browserApiSupported;

  // NOTE: Temporarily Removed isAndroidSecurityKeyEnabled check here because
  // The old challenge code never used this flag for platform support
  // The backend didn't properly initialize this flag

  return {
    platformSupportsPasskey,
    platformSupportsSecurityKey: platformSupportsPasskey, // TODO: replace with metadata.isAndroidSecurityKeyEnabled for android users
  };
};

const usePlatformSupportsPasskeyAndSecurityKey = (
  metadata: PlatformSupportMetadata,
): {
  isFido2SupportedViaHybridApi: () => Promise<boolean>;
  isFido2SupportedViaBrowserApi: () => boolean;
  platformSupportsPasskey: boolean | null;
  platformSupportsSecurityKey: boolean | null;
} => {
  // Get platform support values - start with null to indicate loading
  const [platformSupportsPasskey, setPlatformSupportsPasskey] = useState<boolean | null>(null);
  const [platformSupportsSecurityKey, setPlatformSupportsSecurityKey] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    const updatePlatformSupport = async () => {
      const support = await getPlatformSupport(metadata);
      setPlatformSupportsPasskey(support.platformSupportsPasskey);
      setPlatformSupportsSecurityKey(support.platformSupportsSecurityKey);
    };
    updatePlatformSupport().catch(() => {
      // Platform detection failures are handled by returning false values
      setPlatformSupportsPasskey(false);
      setPlatformSupportsSecurityKey(false);
    });
  }, [metadata]);

  return {
    isFido2SupportedViaHybridApi,
    isFido2SupportedViaBrowserApi,
    platformSupportsPasskey,
    platformSupportsSecurityKey,
  };
};

export default usePlatformSupportsPasskeyAndSecurityKey;
