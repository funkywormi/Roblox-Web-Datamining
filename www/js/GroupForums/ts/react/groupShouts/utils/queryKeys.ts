type GroupKeyTuple = [key: string, groupId: number];
type AnnouncementKeyTuple = [key: string, groupId: number, announcementId: string];

export default {
  getGroupLatestAnnouncementKey: (groupId: number): GroupKeyTuple => [
    'getLatestAnnouncement',
    groupId
  ],
  getAnnouncementKey: (groupId: number, announcementId: string): AnnouncementKeyTuple => [
    'announcement',
    groupId,
    announcementId
  ],
  getGroupMembershipKey: (groupId: number): GroupKeyTuple => ['getGroupMembership', groupId],
  getCommunityInfoKey: (groupId: number): GroupKeyTuple => ['getCommunityInfo', groupId],
  getUserDraftsKey: (groupId: number): GroupKeyTuple => ['getUserDrafts', groupId]
};
