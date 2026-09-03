import { readInlineData } from "react-relay";
import type { EnabledChannelsDescriptionFragment$key } from "../components/__generated__/EnabledChannelsDescriptionFragment.graphql";
import EnabledChannelsDescriptionFragmentNode from "../components/__generated__/EnabledChannelsDescriptionFragment.graphql";
import translationConstants, {
  notificationCategoryPresentationByApiValue,
  channelPresentationByApiValue,
  channelLowercaseLabelByApiValue,
  notificationTypePresentationByApiValue,
} from "../constants/translationConstants";

export const resolveCategoryPresentation = (
  categoryValue: string,
): {
  titleTranslationKey?: string;
  descriptionTranslationKey?: string;
} => {
  const mapped = notificationCategoryPresentationByApiValue[categoryValue];
  if (!mapped) {
    return {};
  }
  return {
    titleTranslationKey: mapped.titleKey,
    descriptionTranslationKey: mapped.descriptionKey,
  };
};

export const resolveNotificationTypePresentation = (
  notificationTypeValue: string,
): { titleTranslationKey?: string } => {
  const mapped = notificationTypePresentationByApiValue[notificationTypeValue];
  if (!mapped) {
    return {};
  }
  return { titleTranslationKey: mapped.labelKey };
};

export const resolveChannelLabelKey = (channelValue: string): string =>
  channelPresentationByApiValue[channelValue]?.labelKey ?? "";

export const resolveChannelDescriptionKey = (channelValue: string): string | undefined =>
  channelPresentationByApiValue[channelValue]?.descriptionKey;

export const resolveChannelLowercaseLabelKey = (channelValue: string): string =>
  channelLowercaseLabelByApiValue[channelValue] ?? "";

const readChannelFragments = (
  channels: readonly EnabledChannelsDescriptionFragment$key[] | null | undefined,
) => (channels ?? []).map(ref => readInlineData(EnabledChannelsDescriptionFragmentNode, ref));

/**
 * Comma-separated, translated labels for channels whose preference is currently enabled
 * i.e "mobile, desktop".
 *
 * `alwaysIncludeChannels` lists channel API values that should always appear in
 * the description regardless of backend channel state (e.g. NotificationCenter,
 * which is implicitly always on for community / experience notifications). They
 * are listed first, in the order provided, and then deduped against any
 * channels enabled in `channels`.
 */
export const getEnabledNotificationChannels = (
  channels: readonly EnabledChannelsDescriptionFragment$key[] | null | undefined,
  translate: (key: string) => string,
  alwaysIncludeChannels: readonly string[] = [],
): string => {
  const enabledFromData = readChannelFragments(channels)
    .filter(c => c.preference.selectedOption?.enabled === true)
    .map(c => c.channel.value);
  const orderedValues = [...new Set([...alwaysIncludeChannels, ...enabledFromData])];
  const labels = orderedValues
    .map(value => {
      const key = resolveChannelLowercaseLabelKey(value);
      return key ? translate(key) : "";
    })
    .filter(Boolean);
  return labels.length > 0 ? labels.join(", ") : translate(translationConstants.off);
};

/**
 * Minimal shape required to determine whether a notification type has any
 * selectable options. Compatible with both
 * `NotificationCategoriesListFragment$data` and `CategoryPageFragment$data`
 * notification type entries.
 */
export type NotificationTypeAvailability = {
  readonly channels: readonly {
    readonly preference: {
      readonly availableOptions: readonly unknown[];
    };
  }[];
};

/**
 * True when at least one channel on the notification type has a non-empty
 * `availableOptions` list (i.e. the user has something to toggle).
 */
export const notificationTypeHasAvailableOptions = (
  notificationType: NotificationTypeAvailability,
): boolean => notificationType.channels.some(c => c.preference.availableOptions.length > 0);
