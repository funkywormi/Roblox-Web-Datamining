import { EnvironmentUrls } from 'Roblox';
import { seoName } from 'core-utilities';

const { websiteUrl } = EnvironmentUrls;

const tableOfBadgeIconName = {
  1: 'icon-badge-administrator',
  2: 'icon-badge-friendship',
  3: 'icon-badge-combat-initiation',
  4: 'icon-badge-warrior',
  5: 'icon-badge-bloxxer',
  6: 'icon-badge-homestead',
  7: 'icon-badge-bricksmith',
  8: 'icon-badge-inviter',
  11: 'icon-badge-builders-club',
  12: 'icon-badge-veteran',
  14: 'icon-badge-ambassador',
  15: 'icon-badge-turbo-builders-club',
  16: 'icon-badge-outrageous-builders-club',
  17: 'icon-badge-official-model-maker',
  18: 'icon-badge-welcome-to-the-club',
  33: 'icon-badge-official-model-maker', // ST1 RobloxBadges.BadgeTypes table set 33 instead of 17
  34: 'icon-badge-welcome-to-the-club' // ST1 RobloxBadges.BadgeTypes table set 34 instead of 18
};

export default {
  getPlayerBadgeUrl(badgeId, badgeName) {
    const removeNonAsciiName = seoName.formatSeoName(badgeName);
    return `${websiteUrl}/badges/${badgeId}/${removeNonAsciiName}`;
  },

  getRobloxBadgeUrl(badgeId) {
    return `${websiteUrl}/info/roblox-badges#Badge${badgeId}`;
  },

  getBadgeIconName(badgeId) {
    return tableOfBadgeIconName[badgeId] || null;
  }
};
