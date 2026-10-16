import { DeviceMeta, getDeviceMeta, isIos13Ipad, isMac } from "@rbx/core-scripts/meta/device";
import { AskSupportCategory } from "../types/supportAsk";
import { DeviceType, SupportMetaData } from "../types/serviceMetadataResponse";

/**
 * Sierra rejects a chat with a blank category, subcategory, or device, and an ask collects none
 * of them, so a chat started from one always needs a value for each.
 */
export const FALLBACK_ASK_CHAT_CATEGORY: AskSupportCategory = {
  category: "AccountOwnership",
  subcategory: "AccountHacked",
};
export const FALLBACK_ASK_CHAT_DEVICE = "Mac";

/**
 * Whether this user is offered the orchestration's exact category and subcategory. The metadata
 * is filtered per user and rollout, which the orchestration cannot see.
 */
export const isAskChatCategoryOffered = (
  supportCategory: AskSupportCategory | null,
  metadata: SupportMetaData | undefined,
): supportCategory is AskSupportCategory =>
  supportCategory !== null &&
  (metadata?.categories ?? []).some(
    ({ mainCategory, subCategories }) =>
      mainCategory.name === supportCategory.category &&
      subCategories.some(({ name }) => name === supportCategory.subcategory),
  );

/** The orchestration's category for the ask, if this user is offered it; otherwise the fallback. */
export const resolveAskChatCategory = (
  supportCategory: AskSupportCategory | null,
  metadata: SupportMetaData | undefined,
): AskSupportCategory =>
  isAskChatCategoryOffered(supportCategory, metadata)
    ? supportCategory
    : FALLBACK_ASK_CHAT_CATEGORY;

const detectDeviceType = (deviceMeta: DeviceMeta | null): DeviceType | null => {
  if (isIos13Ipad()) {
    return DeviceType.Ipad;
  }
  if (deviceMeta?.isXboxApp) {
    return DeviceType.Xbox;
  }
  if (deviceMeta?.isAmazonApp) {
    return DeviceType.AmazonDevice;
  }
  if (deviceMeta?.isIosDevice) {
    return deviceMeta.isTablet ? DeviceType.Ipad : DeviceType.Iphone;
  }
  if (deviceMeta?.isAndroidDevice) {
    return deviceMeta.isTablet ? DeviceType.AndroidTablet : DeviceType.AndroidPhone;
  }
  if (deviceMeta?.isChromeOs) {
    return DeviceType.Chromebook;
  }
  if (isMac()) {
    return DeviceType.Mac;
  }
  if (deviceMeta?.isDesktop) {
    return DeviceType.Pc;
  }
  return null;
};

/** The metadata `name` of the device the user is asking from, which is what Sierra receives. */
export const resolveAskChatDevice = (metadata: SupportMetaData | undefined): string => {
  const deviceType = detectDeviceType(getDeviceMeta());
  return (
    metadata?.deviceTypes.find(({ identifier }) => identifier === deviceType)?.name ??
    FALLBACK_ASK_CHAT_DEVICE
  );
};
