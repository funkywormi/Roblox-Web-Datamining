const itemCardConstants = {
  robloxSystemUserId: 1
};

const thumbnailConstants = {
  size: '420x420',
  format: 'Webp',
  defaultBodyColor: '#A3A2A5'
};

const animationConstants = {
  animationIcons: {
    48: 'icon-animation-climb',
    50: 'icon-animation-fall',
    51: 'icon-animation-idle',
    52: 'icon-animation-jump',
    53: 'icon-animation-run',
    54: 'icon-animation-swim',
    55: 'icon-animation-walk'
  },
  defaultAnimation: 'icon-default-animation'
};

const mode3DAssetTypes = [
  8,
  11,
  12,
  17,
  19,
  27,
  28,
  29,
  30,
  31,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51,
  52,
  54,
  55,
  56,
  61,
  64,
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72
];

const mode3DLocalStorage = 'RobloxUse3DThumbnailsV2';

// Profile Background asset type. Kept local so the 3D-view check does not depend
// on a possibly-older deployed avatar-rules bundle (calling a missing
// AvatarAccoutrementService helper would crash the thumbnail).
const profileBackgroundAssetTypeId = 92;

const makeupAssetTypes = {
  faceMakeup: 88,
  lipMakeup: 89,
  eyeMakeup: 90
};

const makeupTopOrder = 6;

export {
  itemCardConstants,
  thumbnailConstants,
  animationConstants,
  mode3DAssetTypes,
  mode3DLocalStorage,
  profileBackgroundAssetTypeId,
  makeupAssetTypes,
  makeupTopOrder
};
