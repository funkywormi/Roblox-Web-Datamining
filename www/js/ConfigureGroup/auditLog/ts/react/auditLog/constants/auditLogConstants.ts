import { EnvironmentUrls } from 'Roblox';

export const groupBadgeAuditType = {
  enabledBadge: 0,
  disabledBadge: 1,
  updatedBadgeNameDescription: 2
} as const;

export const actionTypes = {
  deletePost: 'Delete Post',
  removeMember: 'Remove Member',
  banMember: 'Ban Member',
  unbanMember: 'Unban Member',
  acceptJoinRequest: 'Accept Join Request',
  declineJoinRequest: 'Decline Join Request',
  postStatus: 'Post Status',
  changeRank: 'Change Rank',
  assignRole: 'Assign Role',
  unassignRole: 'Unassign Role',
  buyAd: 'Buy Ad',
  sendAllyRequest: 'Send Ally Request',
  createEnemy: 'Create Enemy',
  acceptAllyRequest: 'Accept Ally Request',
  declineAllyRequest: 'Decline Ally Request',
  deleteAlly: 'Delete Ally',
  deleteEnemy: 'Delete Enemy',
  addGroupPlace: 'Add Group Place',
  deleteGroupPlace: 'Remove Group Place',
  createItems: 'Create Items',
  configureItems: 'Configure Items',
  spendGroupFunds: 'Spend Group Funds',
  changeOwner: 'Change Owner',
  delete: 'Delete',
  adjustCurrencyAmounts: 'AdjustCurrencyAmounts',
  abandon: 'Abandon',
  claim: 'Claim',
  rename: 'Rename',
  changeDescription: 'Change Description',
  createAsset: 'Create Group Asset',
  updateAsset: 'Update Group Asset',
  configureAsset: 'Configure Group Asset',
  revertAsset: 'Revert Group Asset',
  createDeveloperProduct: 'Create Group Developer Product',
  createGroupDeveloperSubscriptionProduct: 'Create Group Developer Subscription Product',
  configureGame: 'Configure Group Game',
  lock: 'Lock',
  unlock: 'Unlock',
  createGamePass: 'Create Game Pass',
  createBadge: 'Create Badge',
  configureBadge: 'Configure Badge',
  savePlace: 'Save Place',
  publishPlace: 'Publish Place',
  inviteToClan: 'Invite to Clan',
  kickFromClan: 'Kick from Clan',
  cancelClanInvite: 'Cancel Clan Invite',
  buyClan: 'Buy Clan',
  updateRolesetRank: 'Update Roleset Rank',
  updateRolesetData: 'Update Roleset Data',
  createForumCategory: 'Create Forum Category',
  updateForumCategory: 'Update Forum Category',
  deleteForumCategory: 'Delete Forum Category',
  archiveForumCategory: 'Archive Forum Category',
  deleteForumPost: 'Delete Forum Post',
  deleteForumComment: 'Delete Forum Comment',
  createRoleset: 'Create Role Set',
  deleteRoleset: 'Delete Role Set',
  createCommerceProduct: 'Create Commerce Product',
  setCommerceProductActive: 'Set Commerce Product Active',
  archiveCommerceProduct: 'Archive Commerce Product',
  acceptCommerceProductBundlingFee: 'Accept Commerce Product Bundling Fee',
  setCommerceProductInactive: 'Set Commerce Product Inactive',
  rejectCommerceProductBundlingFee: 'Reject Commerce Product Bundling Fee',
  connectMerchant: 'Connect Merchant',
  disconnectMerchant: 'Disconnect Merchant',
  lockForumPost: 'Lock Forum Post',
  unlockForumPost: 'Unlock Forum Post',
  pinForumPost: 'Pin Forum Post',
  unpinForumPost: 'Unpin Forum Post',
  joinGroup: 'Join Group',
  leaveGroup: 'Leave Group',
  updateGroupIcon: 'Update Group Icon',
  updateGroupCoverPhoto: 'Update Group Cover Photo',
  updateGroupSecuritySettings: 'Update Group Security Settings',
  publishAnnouncement: 'Publish Announcement',
  deleteAnnouncement: 'Delete Announcement',
  updateRoleSetPermissions: 'Update Role Set Permissions',
  updateRoleSetPosition: 'Update Role Set Position',
  // Staff-only, and the only audit entries whose actor is Roblox (user 1) rather
  // than a member of the community.
  grantEnterpriseTier: 'Grant Enterprise Tier',
  revokeEnterpriseTier: 'Revoke Enterprise Tier'
} as const;

export const securitySettingType = {
  verificationLevel: 'VerificationLevel',
  accountTenureRequirement: 'AccountTenureRequirement',
  slowmode: 'Slowmode',
  memberListVisibility: 'MemberListVisibility'
} as const;

export const configureGroupAssetAction = [
  'renamed',
  'changed description',
  'disabled',
  'deactivated place',
  'activated place',
  'changed settings',
  'enabled'
] as const;

export const configureGroupGameAction = [
  'updated settings',
  'renamed',
  'changed description',
  'set root place',
  'unrooted place',
  'added place',
  'removed place',
  'changed studio access'
] as const;

export const currencyType = {
  robux: 1,
  tix: 2
} as const;

export const merchantType = {
  shopify: 0
} as const;

export const urls = {
  getAuditLogUrl: (groupId: number): string =>
    `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/audit-log`,
  getUserProfileUrl: (userId: number): string =>
    `${EnvironmentUrls.websiteUrl}/users/${userId}/profile`
};

export const loadPageSize = 25;

export const actionTypeFilters: Record<string, string> = {
  all: 'Label.All',
  deletePost: 'Label.DeletePost',
  removeMember: 'Label.RemoveMember',
  banMember: 'Label.BanMember',
  unbanMember: 'Label.UnbanUser',
  acceptJoinRequest: 'Label.AcceptJoinRequest',
  declineJoinRequest: 'Label.DeclineJoinRequest',
  postStatus: 'Label.PostStatus',
  changeRank: 'Label.ChangeRank',
  assignRole: 'Label.AssignRole',
  unassignRole: 'Label.UnassignRole',
  buyAd: 'Label.BuyAd',
  sendAllyRequest: 'Label.SendAllyRequest',
  createEnemy: 'Label.CreateEnemy',
  acceptAllyRequest: 'Label.AcceptAllyRequest',
  declineAllyRequest: 'Label.DeclineAllyRequest',
  deleteAlly: 'Label.DeleteAlly',
  deleteEnemy: 'Label.DeleteEnemy',
  addGroupPlace: 'Label.AddGroupPlace',
  removeGroupPlace: 'Label.DeleteGroupPlace',
  createItems: 'Label.CreateItems',
  configureItems: 'Label.ConfigureItems',
  spendGroupFunds: 'Label.SpendGroupFunds',
  changeOwner: 'Label.ChangeOwner',
  delete: 'Label.Delete',
  adjustCurrencyAmounts: 'Label.AdjustCurrencyAmounts',
  abandon: 'Label.Abandon',
  claim: 'Label.Claim',
  rename: 'Label.Rename',
  changeDescription: 'Label.ChangeDescription',
  createGroupAsset: 'Label.CreateGroupAsset',
  updateGroupAsset: 'Label.UpdateGroupAsset',
  configureGroupAsset: 'Label.ConfigureGroupAsset',
  revertGroupAsset: 'Label.RevertGroupAsset',
  createGroupDeveloperProduct: 'Label.CreateGroupDeveloperProduct',
  createGroupDeveloperSubscriptionProduct: 'Label.CreateGroupDeveloperSubscriptionProduct',
  configureGroupGame: 'Label.ConfigureGroupGame',
  lock: 'Label.Lock',
  unlock: 'Label.Unlock',
  createGamePass: 'Label.CreateGamePass',
  createBadge: 'Label.CreateBadge',
  configureBadge: 'Label.ConfigureBadge',
  savePlace: 'Label.SavePlace',
  publishPlace: 'Label.PublishPlace',
  inviteToClan: 'Label.InviteToClan',
  kickFromClan: 'Label.KickFromClan',
  cancelClanInvite: 'Label.CancelClanInvite',
  buyClan: 'Label.BuyClan',
  deleteForumCategory: 'Label.DeleteForumCategory',
  deleteForumPost: 'Label.DeleteForumPost',
  deleteForumComment: 'Label.DeleteForumComment',
  lockForumPost: 'Label.LockForumPost',
  unlockForumPost: 'Label.UnlockForumPost',
  pinForumPost: 'Label.PinForumPost',
  unpinForumPost: 'Label.UnpinForumPost',
  joinGroup: 'Action.JoinGroup',
  leaveGroup: 'Action.LeaveGroup',
  changeName: 'Label.ChangeName',
  updateGroupIcon: 'Label.UpdateGroupIcon',
  updateGroupCoverPhoto: 'Label.UpdateGroupCoverPhoto',
  updateGroupSecuritySettings: 'Label.UpdateGroupSecuritySettings',
  updateRolesetData: 'Label.UpdateRoleProperties',
  updateRoleSetPermissions: 'Label.UpdateRoleSetPermissions',
  updateRoleSetPosition: 'Label.UpdateRoleSetPosition'
};

export default {
  groupBadgeAuditType,
  actionTypes,
  securitySettingType,
  configureGroupAssetAction,
  configureGroupGameAction,
  currencyType,
  merchantType,
  urls,
  loadPageSize,
  actionTypeFilters
};
