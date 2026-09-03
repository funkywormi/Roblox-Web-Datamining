import { ValueOf } from "@rbx/core-types";
import * as device from "@rbx/core-scripts/meta/device";
import { eventTypes, sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import browserIdentifier from "./browserIdentifier";

import { appDownloadType, installInstructionStrings, pageName } from "./constants";

function isWindows() {
  return device.isWindows();
}

function isMac() {
  return device.isMac();
}

export const getUserAgent = () => navigator.userAgent;

export const getRecommendedAppDownloadType = (userAgent: string) => {
  const params = new URLSearchParams(document.location.search);
  const downloadType = params.get("downloadType");
  if (downloadType != null) {
    const downloadTypes: Record<string, ValueOf<typeof appDownloadType>> = appDownloadType;
    const download = downloadTypes[downloadType];
    if (download != null) {
      return download;
    }
  }

  if (!userAgent) {
    return appDownloadType.Unknown;
  }
  const meta = device.getDeviceMeta();

  if (meta?.isIosDevice) {
    return appDownloadType.AppleAppStore;
  }

  if (browserIdentifier.isAmazonTablet(userAgent)) {
    return appDownloadType.AmazonAppStore;
  }

  if (meta?.isAndroidDevice) {
    return appDownloadType.GooglePlayStore;
  }

  if (isMac()) {
    return appDownloadType.MacDirectDownload;
  }

  if (isWindows()) {
    return appDownloadType.WindowsDirectDownload;
  }

  return appDownloadType.Unknown;
};

export const getInstallInstructions = () => {
  const userAgent = getUserAgent();

  if (isMac()) {
    if (browserIdentifier.isFirefox(userAgent)) {
      return installInstructionStrings.mac.firefox;
    }
    if (browserIdentifier.isSafari()) {
      return installInstructionStrings.mac.safari;
    }
    return installInstructionStrings.mac.chrome;
  }

  if (browserIdentifier.isFirefox(userAgent)) {
    return installInstructionStrings.windows.firefox;
  }
  if (browserIdentifier.isEdge()) {
    return installInstructionStrings.windows.edge;
  }
  return installInstructionStrings.windows.chrome;
};

export const sendAppClickEvent = (appName: string) => {
  sendEventWithTarget(eventTypes.formInteraction, pageName, {
    field: `${appName}AppLink`,
    aType: "click",
  });
};

export const sendPrimaryAppDownloadClickEvent = (appName: string) => {
  sendEventWithTarget(eventTypes.formInteraction, pageName, {
    field: `${appName}DownloadLink`,
    aType: "click",
  });
};
