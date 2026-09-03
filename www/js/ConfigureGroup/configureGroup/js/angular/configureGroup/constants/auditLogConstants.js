import configureGroupModule from '../configureGroupModule';

const auditLogConstants = {
  groupBadgeAuditType: {
    enabledBadge: 0,
    disabledBadge: 1,
    updatedBadgeNameDescription: 2
  },

  actionTypes: {
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
    deleteAnnouncement: 'Delete Announcement'
  },
  securitySettingType: {
    verificationLevel: 'VerificationLevel',
    accountTenureRequirement: 'AccountTenureRequirement',
    slowmode: 'Slowmode',
    memberListVisibility: 'MemberListVisibility'
  },
  configureGroupAssetAction: [
    'renamed',
    'changed description',
    'disabled',
    'deactivated place',
    'activated place',
    'changed settings',
    'enabled'
  ],
  configureGroupGameAction: [
    'updated settings',
    'renamed',
    'changed description',
    'set root place',
    'unrooted place',
    'added place',
    'removed place',
    'changed studio access'
  ],
  currencyType: {
    robux: 1,
    tix: 2
  },
  merchantType: {
    shopify: 0
  }
};

configureGroupModule.constant('auditLogConstants', auditLogConstants);

export default auditLogConstants;
