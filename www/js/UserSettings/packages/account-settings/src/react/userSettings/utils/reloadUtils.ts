import { DeviceMeta } from "Roblox";
/*
 * This function is used to reload the page.
 * It checks if the device is an Android app and reloads the page accordingly.
 * Because window.location.reload() does not work for Android webview
 * See https://github.com/react-native-webview/react-native-webview/issues/602
 */
const reloadPage = (): void => {
  if (DeviceMeta().isAndroidApp) {
    window.location.href =
      window.location.origin + window.location.pathname + window.location.search;
  } else {
    window.location.reload();
  }
};

export default { reloadPage };
