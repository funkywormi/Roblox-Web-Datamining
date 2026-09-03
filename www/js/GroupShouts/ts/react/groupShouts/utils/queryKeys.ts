type GroupKeyTuple = [key: string, groupId: number];

export default {
  getGroupLatestAnnouncementKey: (groupId: number): GroupKeyTuple => [
    'getLatestAnnouncement',
    groupId
  ],
  getGroupMembershipKey: (groupId: number): GroupKeyTuple => ['getGroupMembership', groupId],
  getCommunityInfoKey: (groupId: number): GroupKeyTuple => ['getCommunityInfo', groupId],
  getUserDraftsKey: (groupId: number): GroupKeyTuple => ['getUserDrafts', groupId]
};
