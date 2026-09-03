import type { ComponentProps } from "react";
import type { ValueOf } from "@rbx/core-types";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import type { Icon } from "@rbx/foundation-ui";

type FoundationIconName = ComponentProps<typeof Icon>["name"];

export const appDownloadType = {
  Unknown: 1,
  WindowsDirectDownload: 2,
  WindowsStore: 3,
  MacDirectDownload: 4,
  AppleAppStore: 5,
  GooglePlayStore: 6,
  AmazonAppStore: 7,
} as const;

export const pageName = "downloadV2";

export const installInstructionsDelayMs = 1000;

export const appDownloadTranslationConfig = ["Feature.DownloadLanding", "Common.VisitGame"];

export const downloadPageStrings = {
  downloadPageHeader: "Heading.DownloadPage",
  appStoreLinksHeader: "Heading.AppStoreLinks",
  // Download buttons
  windowsDownloadLabel: "Action.DownloadWindowsApp",
  windowsDownloadLink: getAbsoluteUrl("/download/client?os=win"),
  macDownloadLabel: "Action.DownloadMacApp",
  macDownloadLink: getAbsoluteUrl("/download/client?os=mac"),
  androidAppDownloadLabel: "Action.DownloadAndroidApp",
  amazonStoreLink: "Link.AmazonStoreRobloxApp",
  googlePlayStoreLink: "Link.GooglePlayStoreRobloxApp",
  iOSDownloadLabel: "Action.DownloadiOSApp",
  appleAppStoreLink: "Link.AppleAppStoreRobloxApp",
  // Install Instructions
  downloadConfirmationHeader: "Heading.DownloadConfirmation",
  followInstallStepsLabel: "Label.FollowInstallSteps",
  retryDownloadLabel: "Label.RetryDownload",
  installInstructionsHeader: "Heading.InstallInstructions",
  mobileAppDownloadOptionHeading: "Heading.MobileAppDownloadOption",
  mobileAppQrCodeLabel: "Label.MobileAppQrCode",
};

export const installInstructionStrings = {
  windows: {
    chrome: [
      "Response.Dialog.PcChromeFirstInstruction",
      "Response.Dialog.PcChromeSecondInstruction",
      "Response.Dialog.PcChromeThirdInstruction",
    ],
    edge: [
      "Response.Dialog.PcEdgeFirstInstruction",
      "Response.Dialog.PcEdgeSecondInstruction",
      "Blank",
    ],
    firefox: [
      "Response.Dialog.PcFirefoxFirstInstruction",
      "Response.Dialog.PcFirefoxSecondInstruction",
      "Response.Dialog.PcFirefoxThirdInstruction",
    ],
  },
  mac: {
    chrome: [
      "Response.Dialog.MacChromeFirstInstruction",
      "Response.Dialog.MacChromeSecondInstruction",
      "Response.Dialog.MacChromeThirdInstruction",
    ],
    firefox: [
      "Response.Dialog.MacFirefoxFirstInstruction",
      "Response.Dialog.MacFirefoxSecondInstruction",
      "Response.Dialog.MacFirefoxThirdInstruction",
    ],
    safari: [
      "Response.Dialog.MacSafariFirstInstruction",
      "Response.Dialog.MacSafariSecondInstruction",
      "Response.Dialog.MacSafariThirdInstruction",
    ],
  },
};

export type AppDownloadLink = {
  href: string;
  title: string;
  name: string;
  /** Foundation icon used by the shared DownloadButton component. */
  icon: FoundationIconName;
  /** Legacy CSS icon class for existing download surfaces. */
  legacyIcon: string;
  isDirectDownload: boolean;
};

export const appDownloadLinkConstants: Partial<
  Record<ValueOf<typeof appDownloadType>, AppDownloadLink>
> = {
  [appDownloadType.WindowsDirectDownload]: {
    href: downloadPageStrings.windowsDownloadLink,
    title: downloadPageStrings.windowsDownloadLabel,
    name: "windows",
    icon: "icon-filled-microsoft",
    legacyIcon: "icon-logo-win",
    isDirectDownload: true,
  },
  [appDownloadType.MacDirectDownload]: {
    href: downloadPageStrings.macDownloadLink,
    title: downloadPageStrings.macDownloadLabel,
    name: "mac",
    icon: "icon-filled-apple",
    legacyIcon: "icon-logo-apple",
    isDirectDownload: true,
  },
  [appDownloadType.AmazonAppStore]: {
    href: downloadPageStrings.amazonStoreLink,
    title: downloadPageStrings.androidAppDownloadLabel,
    name: "amazonStore",
    icon: "icon-filled-amazon",
    legacyIcon: "icon-logo-android",
    isDirectDownload: false,
  },
  [appDownloadType.GooglePlayStore]: {
    href: downloadPageStrings.googlePlayStoreLink,
    title: downloadPageStrings.androidAppDownloadLabel,
    name: "android",
    icon: "icon-filled-android",
    legacyIcon: "icon-logo-android",
    isDirectDownload: false,
  },
  [appDownloadType.AppleAppStore]: {
    href: downloadPageStrings.appleAppStoreLink,
    title: downloadPageStrings.iOSDownloadLabel,
    name: "iOS",
    icon: "icon-filled-apple",
    legacyIcon: "icon-logo-apple",
    isDirectDownload: false,
  },
};
