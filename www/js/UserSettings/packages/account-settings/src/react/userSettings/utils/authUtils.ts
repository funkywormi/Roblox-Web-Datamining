/**
 * Check if passkey is enabled for Android in passkey metadata from meta tag
 *
 * @returns {boolean}
 */
export const isAndroidPasskeyEnabled = (): boolean => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="passkey-data-android"]');
  const keyMap = metaTag?.dataset || {};
  return keyMap.isPasskeyLoginEnabledAndroid === "true";
};

export default {
  isAndroidPasskeyEnabled,
};
