export enum PermissionTab {
  GENERAL = 'General',
  COMMUNITY = 'Community',
  CREATION = 'Creation',
}

export const PERMISSION_TAB_GROUP_IDS: Record<PermissionTab, ReadonlySet<string>> = {
  [PermissionTab.GENERAL]: new Set(['Group.GeneralGroup']),
  [PermissionTab.COMMUNITY]: new Set([
    'Group.PostsGroup',
    'Group.ForumGroup',
    'Group.ContentModerationGroup',
    'Group.MiscellaneousGroup',
  ]),
  [PermissionTab.CREATION]: new Set([
    'Group.CreationsGroup',
    'Group.AnalyticsGroup',
    'Group.MonetizationGroup',
    'Group.AvatarItemGroup',
    'Group.APIGroup',
    'Group.DevelopmentItemGroup',
    'Group.DataStoresGroup',
    'Group.NotificationsGroup',
    'Group.CommunicationGroup',
    'Group.TalentHubGroup',
    'Group.LegacyGroup',
  ]),
};

export const ORDERED_PERMISSION_TABS_COMMUNITY: readonly PermissionTab[] = [
  PermissionTab.GENERAL,
  PermissionTab.COMMUNITY,
  PermissionTab.CREATION,
] as const;

export const ORDERED_PERMISSION_TABS_CREATION: readonly PermissionTab[] = [
  PermissionTab.GENERAL,
  PermissionTab.CREATION,
  PermissionTab.COMMUNITY,
] as const;
