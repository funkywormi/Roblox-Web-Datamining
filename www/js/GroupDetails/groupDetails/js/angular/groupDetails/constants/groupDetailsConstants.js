import { Endpoints, EnvironmentUrls } from 'Roblox';
import groupModule from '../groupModule';

const groupDetailsConstants = {
  urls: {
    updateGroupStatus: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/status`,

    // Games API
    groupGamesV2: `${EnvironmentUrls.gamesApi}/v2/groups/{groupId}/gamesV2`,
    games: `${EnvironmentUrls.gamesApi}/v1/games`,
    gameVotes: `${EnvironmentUrls.gamesApi}/v1/games/votes`,

    // Catalog API
    catalogSearch: `${EnvironmentUrls.catalogApi}/v1/search/items`,
    catalogDetails: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`
  },

  absoluteUrls: {
    abuseReportRevamp: Endpoints.getAbsoluteUrl(
      '/report-abuse/?targetId={targetId}&submitterId={submitterId}&abuseVector={abuseVector}&custom={custom}'
    ),
    reportAbuse: Endpoints.getAbsoluteUrl('/abuseReport/{type}?id={id}&RedirectUrl={absUrl}'),
    privacySettings: Endpoints.getAbsoluteUrl('/my/account#!/privacy')
  },

  tabs: {
    about: {
      translationKey: 'Heading.About',
      state: 'about'
    },
    forums: {
      translationKey: 'Heading.Forums',
      state: 'forums',
      label: 'Forums'
    },
    events: {
      translationKey: 'Heading.Events',
      state: 'events'
    },
    store: {
      translationKey: 'Heading.Store',
      state: 'store'
    },
    affiliates: {
      translationKey: 'Heading.Affiliates',
      state: 'affiliates'
    }
  },

  stateToTab: {
    'forums.category': 'forums',
    'forums.category.post': 'forums',
    'forums.category.post.comment': 'forums',
    'forums.category.createPost': 'forums',
    'forums.category.post.edit': 'forums'
  },

  locationType: {
    iconOnline: 1,
    iconStudio: 3,
    iconGame: 2
  },

  joinStatus: {
    inGroup: 1,
    maxGroups: 2,
    joinPending: 4,
    groupClosed: 5,
    restricted: 6,
    allowed: 7
  },

  // Pagers
  membersPageSize: 9,
  gamesPageSize: 6,
  affiliatesPageSize: 6,
  storePageSize: 24,
  cursorPageLoadSize: 50,
  gamesPageLoadSize: 50,

  makePrimaryActionButtonId: 'make-primary-button',
  removePrimaryActionButtonId: 'remove-primary-button',

  translations: {
    no: 'Action.No',
    leaveGroupError: 'Message.LeaveGroupError',
    unfollowGroupError: 'Message.UnfollowError',
    sendPostError: 'Message.SendPostError',
    postFilteredError: 'Error.WallPostKeywordMatched',
    defaultError: 'Message.DefaultError',
    joinGroupPendingSuccess: 'Message.JoinGroupPendingSuccess',
    joinGroupSuccess: 'Message.JoinGroupSuccess',
    joinGroupError: 'Message.JoinGroupError',
    followGroupSuccess: 'Message.FollowSuccess',
    claimOwnershipSuccess: 'Message.ClaimOwnershipSuccess',
    claimOwnershipError: 'Message.ClaimOwnershipError',
    makePrimaryGroup: 'Heading.MakePrimaryGroup',
    makePrimaryGroupWarning: 'Description.MakePrimaryGroupWarning',
    makePrimaryError: 'Message.MakePrimaryError',
    removePrimaryGroup: 'Heading.RemovePrimaryGroup',
    removePrimaryGroupWarning: 'Description.RemovePrimaryGroupWarning',
    removePrimaryError: 'Message.RemovePrimaryError'
  },

  reportAbuseName: {
    group: 'Heading.NameOrAssetsOrDescription',
    announcements: 'Heading.Announcements',
    role: 'Heading.Role'
  },
  policies: {
    displayDescription: false,
    displayMembers: false,
    displayRank: false,
    checkGroupOrigin: false,
    displayGroupAnnouncements: false,
    displayMarketplaceEmbed: false,
    isGroupVerificationRequiredToJoin: false,
    displayGroupAnnouncementPublishing: false,
    isGracefulDegradationEnabled: false,
    isMemberListVisibilityEnforced: false,
    canViewMemberList: false
  },

  challengeData: {
    defaultProofOfWorkData: { sessionId: '', redemptionToken: '' }
  }
};

groupModule.constant('groupDetailsConstants', groupDetailsConstants);
export default groupDetailsConstants;
