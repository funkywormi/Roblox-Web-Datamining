const currentWearingContainer = (): HTMLElement | null =>
  document.getElementById('profile-current-wearing-avatar');

const currentWearingTranslationMap = {
  currentlyWearing: 'Heading.CurrentlyWearing'
};

const avatarMode = {
  twoD: '2D',
  threeD: '3D'
};

const avatarModeKey = 'profileAvatarMode';
const avatarThumbnailSize = '352x352';

const maxCurrentWearingPage = 9;
const currentWearingPerPage = 8;

const restrictionType = {
  limitedUnique: 'LimitedUnique',
  limited: 'Limited',
  collectible: 'Collectible'
};

export default {
  currentWearingContainer,
  currentWearingTranslationMap,
  avatarMode,
  avatarModeKey,
  avatarThumbnailSize,
  maxCurrentWearingPage,
  currentWearingPerPage,
  restrictionType
};
