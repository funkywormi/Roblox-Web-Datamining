/**
 * Shared role settings translation keys used across Angular and React components
 * This file serves as a single source of truth for role permission settings
 */
export const roleSettings = {
  // Section headers
  groupPostsPermissions: 'Heading.PostsPermissions',
  groupForumsPermissions: 'Heading.ForumsPermissions',
  groupMembershipPermissions: 'Heading.MembershipPermissions',
  groupEconomyPermissions: 'Heading.EconomyPermissions',
  groupManagementPermissions: 'Heading.ManagementPermissions',
  groupOpenCloudPermissions: 'Heading.OpenCloudPermissions',
  groupContentModerationPermissions: 'Heading.ContentModerationPermissions',

  // Open Cloud
  administerCloudAuthentication: 'Label.AdministerCloudAuthentication',
  useCloudAuthentication: 'Label.ManageCloudAuthentication',

  // Announcements
  viewStatus: 'Label.ViewAnnouncements',
  postToStatus: 'Label.PostAnnouncements',

  // Members
  changeRank: 'Label.ChangeRanks',
  inviteMembers: 'Label.InviteMembers',
  removeMembers: 'Label.RemoveMembers',
  banMembers: 'Label.BanMembers',

  // Misc
  manageRelationships: 'Label.ManageRelationships',
  viewAuditLogs: 'Label.ViewAuditLogs',

  // Assets (Creator based perms)
  spendGroupFunds: 'Label.SpendGroupFund',
  createItems: 'Label.CreateItem',
  manageItems: 'Label.ManageItems',
  manageGroupGames: 'Label.ManageGroupGames',
  viewAnalytics: 'Label.ViewAnalytics',
  viewCommunityAnalytics: 'Label.ViewCommunityAnalytics',

  // Forums
  viewForums: 'Label.ViewForums',
  manageCategories: 'Label.ManageForumCategories',
  createPosts: 'Label.CreateForumPosts',
  removePosts: 'Label.RemoveForumPosts',
  lockPosts: 'Label.LockForumPosts',
  pinPosts: 'Label.PinForumPosts',
  createComments: 'Label.CreateForumComments',
  removeComments: 'Label.RemoveForumComments',

  // Content Moderation
  manageKeywordBlockList: 'Label.ManageContentModeration',
  viewKeywordBlockList: 'Label.ViewContentModeration',
  bypassSlowmode: 'Label.BypassSlowMode'
};

export default roleSettings;
