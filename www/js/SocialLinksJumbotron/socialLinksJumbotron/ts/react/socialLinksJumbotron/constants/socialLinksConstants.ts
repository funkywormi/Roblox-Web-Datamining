import { EnvironmentUrls } from 'Roblox';
import { TSocialLinkType } from '../types/socialLinksType';

const { gamesApi } = EnvironmentUrls;

const url = {
  getGameSocialLinks: (universeId: string): { url: string; withCredentials: boolean } => ({
    url: `${gamesApi}/v1/games/${universeId}/social-links/list`,
    withCredentials: true
  })
};

const iconMap = {
  [TSocialLinkType.Amazon]: 'icon-social-media-amazon',
  [TSocialLinkType.Discord]: 'icon-social-media-discord',
  [TSocialLinkType.Facebook]: 'icon-social-media-facebook',
  [TSocialLinkType.RobloxGroup]: 'icon-social-media-roblox',
  [TSocialLinkType.Twitch]: 'icon-social-media-twitch',
  [TSocialLinkType.Twitter]: 'icon-social-media-twitter',
  [TSocialLinkType.Youtube]: 'icon-social-media-youtube',
  [TSocialLinkType.Guilded]: 'icon-social-media-guilded'
};

const socialLinksTranslationMap = {
  sectionHeader: 'HeadingSocialLinks',
  modalHeader: 'Message.SocialLinkoffPlatformModalTitle',
  modalBody: 'Message.SocialLinkoffPlatformModalBody',
  modalConfirm: 'Message.SocialLinkoffPlatformModalContinueButtonText',
  modalCancel: 'Message.SocialLinkoffPlatformModalCancelButtonText'
};

const socialLinksCounterEvents = {
  SocialLinkJumbotronNoValidTypeToSendImpressions:
    'SocialLinkJumbotronNoValidTypeToSendImpressions',
  SocialLinkJumbotronNoSocialLinksToSendImpressions:
    'SocialLinkJumbotronNoSocialLinksToSendImpressions',
  SocialLinkJumbotronUnableToConvertAssignmentIdToNumber:
    'SocialLinkJumbotronUnableToConvertAssignmentIdToNumber'
};

export default {
  socialLinksTranslationMap,
  iconMap,
  url,
  socialLinksCounterEvents
};
