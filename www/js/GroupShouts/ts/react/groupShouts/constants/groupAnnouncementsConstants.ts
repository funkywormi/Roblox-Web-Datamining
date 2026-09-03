import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl, groupsApi, catalogApi } = EnvironmentUrls;

const communityLinksGroupsUrlPrefix = `${apiGatewayUrl}/community-links/v1/groups`;
const communityLinksGuildedUrlPrefix = `${apiGatewayUrl}/community-links/v1/guilded`;

const groupsAnnouncementsUrlPrefix = `${groupsApi}/v1/groups`;

const guildedAttributionSource = 'rgp'; // rgp = roblox group page

export default {
  urls: {
    getGroupCommunityInfoUrl(groupId: number): string {
      return `${communityLinksGroupsUrlPrefix}/${groupId}/community`;
    },
    getGroupCommunityLinkUrl(groupId: number): string {
      return `${communityLinksGroupsUrlPrefix}/${groupId}/community/link`;
    },
    getUserCommunityChannelsUrl(communityId: string): string {
      return `${communityLinksGuildedUrlPrefix}/user/community/${communityId}/channels/announcements`;
    },
    getGroupMembershipUrl(groupId: number): string {
      return `${groupsApi}/v1/groups/${groupId}/membership`;
    },
    getGroupNotificationPreferenceUrl(groupId: number): string {
      return `${groupsApi}/v1/groups/${groupId}/notification-preference`;
    },
    getCatalogItemDetailsUrl(itemType: string, id: number): string {
      return `${catalogApi}/v1/catalog/items/${id}/details?itemType=${itemType}`;
    },
    getViewCommunityUrl(communityId: string, loginToken?: string): string {
      return `${EnvironmentUrls.guildedBaseUrl}/teams/${communityId}?a=${guildedAttributionSource}${
        loginToken ? `&token=${loginToken}` : ''
      }`;
    },
    getJoinCommunityUrl(communityId: string): string {
      return `${communityLinksGuildedUrlPrefix}/${communityId}/join?a=${guildedAttributionSource}`;
    },
    getViewAnnouncementChannelUrl(
      communityId: string,
      channelId: string,
      loginToken?: string
    ): string {
      return `${
        EnvironmentUrls.guildedBaseUrl
      }/teams/${communityId}/channels/${channelId}/announcements?a=${guildedAttributionSource}${
        loginToken ? `&token=${loginToken}` : ''
      }`;
    },
    getGroupCommunityValidateUrl(groupId: number): string {
      return `${communityLinksGroupsUrlPrefix}/${groupId}/community/validate`;
    },

    // --- Announcements API (groups-api v1) ---
    getUserDraftsUrl: `${groupsAnnouncementsUrlPrefix}/announcements/drafts`,
    getAnnouncementsUrl(groupId: number): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements`;
    },
    getLatestAnnouncementUrl(groupId: number): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements/latest`;
    },
    getAnnouncementUrl(groupId: number, announcementId: string): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements/${announcementId}`;
    },
    getCreateDraftUrl(groupId: number): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements/drafts`;
    },
    getPublishDraftUrl(groupId: number, draftId: string): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements/drafts/${draftId}/publish`;
    },
    getAnnouncementReactionUrl(
      groupId: number,
      announcementId: string,
      messageId: string,
      emoteId: string
    ): string {
      return `${groupsAnnouncementsUrlPrefix}/${groupId}/announcements/${announcementId}/messages/${messageId}/reactions/${emoteId}`;
    },

    reportAbuseRevamp({
      targetId,
      submitterId,
      abuseVector,
      custom
    }: {
      targetId: string;
      submitterId: string;
      abuseVector: string;
      custom: Record<string, string>;
    }): string {
      const params = new URLSearchParams({
        targetId,
        submitterId,
        abuseVector,
        custom: JSON.stringify(custom)
      });
      return `/report-abuse/?${params.toString()}`;
    },
    guildedUserUrl: `${communityLinksGuildedUrlPrefix}/user`,
    guildedUserServersUrl: `${communityLinksGuildedUrlPrefix}/user/servers`,
    guildedTermsUrl: 'https://support.guilded.gg/hc/en-us/articles/360039728313-Terms-of-use',
    guildedPrivacyPolicyUrl: 'https://support.guilded.gg/hc/en-us/articles/360039235054-Privacy'
  },
  embedUrlRegexes: {
    catalogItem: /(roblox\.com|robloxlabs\.com)\/catalog\/(\d+)/
  },
  limits: {
    communityNameMinLength: 3,
    communityNameMaxLength: 30
  },
  routes: {
    base: '/',
    createAnnouncement: '/create-announcement',
    editAnnouncement: '/edit-announcement'
  },
  validation: {
    titleMinLength: 3,
    titleMaxLength: 120,
    contentMinLength: 3,
    contentMaxLength: 1000
  },
  // Vertical identifier pre-configured in the Custom Forms API; must match server-side config.
  customFormsVertical: 'fe02680f247961a1369a66f681f990ec1e4a8708a2e84871019a93a7287ae7dd'
};
