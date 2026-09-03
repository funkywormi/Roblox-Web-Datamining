import { UserSetting } from "@rbx/user-settings";
import { TChildInfo } from "../../../types/childrenInfoTypes";

/** Structural subset of the V1 and V2 settings bodies, which are otherwise unrelated types. */
export type TExperienceChatSettingsAndOptions = {
  [UserSetting.whoCanChatWithMeInExperiences]?: unknown;
  [UserSetting.whoCanWhisperChatWithMeInExperiences]?: unknown;
};

type TExperienceChatVisibilityArgs = {
  settingsAndOptions: TExperienceChatSettingsAndOptions | undefined;
  child?: TChildInfo;
};

/**
 * `/settings-and-options` omits settings the user is not entitled to. An omitted
 * setting yields an empty options array, which renders as a titled row with an
 * empty radio group rather than as nothing.
 */
export const hasExperienceChatSetting = (
  settingsAndOptions: TExperienceChatSettingsAndOptions | undefined,
): boolean => !!settingsAndOptions?.[UserSetting.whoCanChatWithMeInExperiences];

export const hasDirectChatSetting = (
  settingsAndOptions: TExperienceChatSettingsAndOptions | undefined,
): boolean => !!settingsAndOptions?.[UserSetting.whoCanWhisperChatWithMeInExperiences];

/** Excludes the direct chat permission, which admits a parent for direct chat alone. */
export const hasExperienceChatPermission = (child?: TChildInfo): boolean =>
  !child?.userId ||
  !!child.canParentManageChildsCommunicationSettings ||
  !!child.canParentAccessChildBasicPrivacySettings;

export const canSeeExperienceChatRow = ({
  settingsAndOptions,
  child,
}: TExperienceChatVisibilityArgs): boolean =>
  hasExperienceChatSetting(settingsAndOptions) && hasExperienceChatPermission(child);

/**
 * Composed from the row predicates rather than raw key presence, so a subtab whose
 * rows are all hidden collapses instead of rendering a description and disclaimer
 * with nothing under them.
 */
export const shouldDisplayExperienceChatSubtab = ({
  settingsAndOptions,
  child,
}: TExperienceChatVisibilityArgs): boolean =>
  canSeeExperienceChatRow({ settingsAndOptions, child }) ||
  hasDirectChatSetting(settingsAndOptions);
