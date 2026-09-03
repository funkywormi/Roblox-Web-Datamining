import { EnvironmentUrls } from 'Roblox';
import socialLinksCommonModule from '../socialLinksCommonModule';

const socialLinksConstants = {
  // Api domains for social links (keyed by social link type, value should match url base.)
  urlBase: {
    getGameSocialLinks: EnvironmentUrls.gamesApi,
    getGroupSocialLinks: EnvironmentUrls.groupsApi,
    setGameSocialLinks: EnvironmentUrls.developApi,
    setGroupSocialLinks: EnvironmentUrls.groupsApi,
    getGameSocialLinksMetadata: EnvironmentUrls.developApi,
    getUserSocialLinks: EnvironmentUrls.accountInformationApi
  },

  urlRegexes: {
    facebook: /^((http|https):\/\/)?(www\.)?facebook\.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile\.php\?id=(?=\d.*))?([\w\-]*)?$/,
    twitter: /^(((http|https):\/\/)?(www\.)?(twitter|x)\.com\/|@)(?!logout(\/|$))([a-zA-Z0-9_]{1,15})$/,
    youtube: /^((http|https):\/\/)?(www\.)?youtube\.com\/(?!opensearch(\/|$))(?!.*\blogout\b)[@a-zA-Z0-9\-\/_]+$/,
    twitch: /^((http|https):\/\/)?(www\.)?twitch\.tv\/[a-zA-Z0-9\-/_]+$/,
    discord: /^((http|https):\/\/)?(www\.)?discord\.(gg|io|me|li)\/[a-zA-Z0-9\-_/]+$/,
    robloxGroup: /^(?:https?):\/\/(?:[a-z0-9-]{2,}\.)*(?:roblox(labs)?\.com\/)(?:groups\/|communities\/)(?<groupId>[\d]+)\/?(?:[A-Za-z0-9-]+)?(?:#!\/)?(?:[A-Za-z0-9]+)?$/,
    amazon: /^((https?):\/\/)?(www\.)?amazon\.com\/stores\/page\/[\w\-/]+(\?[\w\-/]+(=[\w\-/]*)?(&[\w\-/]+(=[\w\-/]*)?)*)?$/,
    guilded: /^((http|https):\/\/)?(www\.)?guilded\.gg\/((profile|teams|i|r|u)\/)?([a-zA-Z0-9-]{3,30})(\/(overview))?(\?[i|r]=?([a-zA-Z0-9-]{3,16}))?$/
  },

  targetTypes: {
    game: 'game',
    group: 'group',
    user: 'user'
  },

  socialLinkDisplayTypes: {
    icon: 'icon',
    card: 'card'
  },

  socialMediaTypes: {
    facebook: 'Facebook',
    twitter: 'Twitter',
    youtube: 'YouTube',
    twitch: 'Twitch',
    discord: 'Discord',
    robloxGroup: 'RobloxGroup',
    amazon: 'Amazon',
    guilded: 'Guilded'
  },

  socialMediaNames: {
    Facebook: 'Facebook',
    Twitter: 'Twitter',
    YouTube: 'YouTube',
    Twitch: 'Twitch',
    Discord: 'Discord',
    Amazon: 'Amazon',
    RobloxGroup: 'Roblox Group',
    Guilded: 'Guilded'
  },

  // Values should match keys in socialMediaTypes
  availableSocialMediaTypes: {
    game: ['facebook', 'twitter', 'youtube', 'twitch', 'discord', 'robloxGroup', 'amazon'],
    group: ['facebook', 'twitter', 'youtube', 'twitch', 'discord'],
    user: ['facebook', 'twitter', 'youtube', 'twitch']
  },

  availableIconTypes: [
    'Facebook',
    'Twitter',
    'YouTube',
    'Twitch',
    'Discord',
    'RobloxGroup',
    'GitHub',
    'Amazon',
    'Guilded'
  ],

  eventSteamEventNames: {
    click: 'socialLinkClickEvent'
  },

  layout: {
    maxUrlLength: 256,
    maxNameLength: 70
  },

  errorCodes: {
    // Error codes used this angular component.
    internal: {
      unknownError: 0,
      invalidTarget: 1,
      featureDisabled: 2,
      invalidViewer: 3,
      invalidTitle: 4,
      invalidUrl: 5,
      invalidType: 6,
      unauthorized: 7,
      socialLinkRemoved: 8,
      noGroupPermission: 9,
      noMetadata: 10
    },

    // Mapping from error codes returned by Groups Api -> error codes used by this angular component.
    getGroupSocialLinks: {
      1: 1, // Group is invalid.
      11: 2, // Feature disabled.
      13: 3 // User not allowed to view social links.
    },

    // Mapping from error codes returned by Games Api -> error codes used by this angular component.
    getGameSocialLinks: {
      2: 2, // Feature disabled.
      3: 3, // User not allowed to view social links.
      10: 10 // User recieved an error fetching their social link metadata.
    },

    setGameSocialLinks: {
      1: 7, // User does not have permission to update social links.
      2: 4, // Title too long.
      3: 4, // Title cannot be empty.
      4: 5, // Url cannot be empty.
      7: 8, // Social link no longer exists.
      8: 6, // Type is invalid.
      11: 4, // Title moderated.
      18: 9 // The user does not have permission to the group they are trying to add.
    },

    setGroupSocialLinks: {
      1: 1, // Group is invalid.
      2: 7, // User does not have permission to update social links.
      3: 4, // Title is too long.
      4: 4, // Title cannot be empty.
      5: 5, // Url cannot be empty.
      6: 5, // Url is invalid format.
      8: 8, // Social link no longer exists.
      9: 6, // Type is invalid.
      12: 4, // Title moderated.
      16: 6 // Type already exists.
    },

    getUserSocialLinks: {
      1: 1 // User is invalid.
    }
  },

  translations: {
    socialLinkoffPlatformModalTitle: 'Message.SocialLinkoffPlatformModalTitle',
    socialLinkoffPlatformModalBody: 'Message.SocialLinkoffPlatformModalBody',
    socialLinkoffPlatformModalContinueButtonText:
      'Message.SocialLinkoffPlatformModalContinueButtonText',
    socialLinkoffPlatformModalCancelButtonText:
      'Message.SocialLinkoffPlatformModalCancelButtonText',
    socialLinkRemoved: 'Message.SocialLinkRemoved',
    socialLinkSaved: 'Message.SocialLinkSaved',
    socialLinkInvalidError: 'Message.SocialLinkInvalidError',
    socialLinksEditDisabledError: 'Message.SocialLinksEditDisabledError',
    unauthorizedError: 'Message.UnauthorizedError',
    titleModeratedError: 'Message.TitleModeratedError',
    unknownError: 'Message.UnknownError',
    socialLinkTypeLimitError: 'Message.SocialLinkTypeLimitError',
    urlSocialMediaTypeMismatchError: 'Message.UrlSocialMediaTypeMismatchError',
    urlEmptyError: 'Message.UrlEmptyError',
    titleEmptyError: 'Message.TitleEmptyError',
    noGroupPermission: 'Message.NoGroupPermission'
  }
};

socialLinksCommonModule.constant('socialLinksConstants', socialLinksConstants);
export default socialLinksConstants;
