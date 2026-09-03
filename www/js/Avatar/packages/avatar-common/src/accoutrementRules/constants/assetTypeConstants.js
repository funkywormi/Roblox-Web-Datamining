const wearableAssetTypes = [
  {
    maxNumber: 1,
    id: 18,
    name: "Face",
    type: "Face",
    catalogNameKey: "Label.Face",
    category: "bodyPart",
    slot: {
      name: "FaceClassic",
      catalogNameKey: "Label.Face",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 19,
    name: "Gear",
    type: "Gear",
    catalogNameKey: "Label.Gear",
    category: "accessory",
    slot: {
      name: "GearAccessory",
      catalogNameKey: "Label.Gear",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 17,
    name: "Head",
    type: "Head",
    assetTypesToUnequip: [76, 77, 78, 79],
    body: true,
    catalogNameKey: "Label.AccessoryHead",
    category: "bodyPart",
    slot: {
      name: "HeadClassic",
      catalogNameKey: "Label.AccessoryHead",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 29,
    name: "Left Arm",
    type: "LeftArm",
    body: true,
    catalogNameKey: "Label.LeftArm",
    category: "bodyPart",
    slot: {
      name: "LeftArm",
      catalogNameKey: "Label.LeftArm",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 30,
    name: "Left Leg",
    type: "LeftLeg",
    body: true,
    catalogNameKey: "Label.LeftLeg",
    category: "bodyPart",
    slot: {
      name: "LeftLeg",
      catalogNameKey: "Label.LeftLeg",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 12,
    name: "Pants",
    type: "Pants",
    catalogNameKey: "Label.Clothing.ClassicPants",
    category: "clothing",
    slot: {
      name: "ClassicPants",
      catalogNameKey: "Label.Clothing.ClassicPants",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 28,
    name: "Right Arm",
    type: "RightArm",
    body: true,
    catalogNameKey: "Label.RightArm",
    category: "bodyPart",
    slot: {
      name: "RightArm",
      catalogNameKey: "Label.RightArm",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 31,
    name: "Right Leg",
    type: "RightLeg",
    body: true,
    catalogNameKey: "Label.RightLeg",
    category: "bodyPart",
    slot: {
      name: "RightLeg",
      catalogNameKey: "Label.RightLeg",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 11,
    name: "Shirt",
    type: "Shirt",
    catalogNameKey: "Label.ClassicShirt",
    category: "clothing",
    slot: {
      name: "ClassicShirt",
      catalogNameKey: "Label.ClassicShirt",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 2,
    name: "T-Shirt",
    type: "TShirt",
    catalogNameKey: "Label.ClassicTShirt",
    category: "clothing",
    slot: {
      name: "ClassicTShirt",
      catalogNameKey: "Label.ClassicTShirt",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 27,
    name: "Torso",
    type: "Torso",
    body: true,
    catalogNameKey: "Label.Torso",
    category: "bodyPart",
    slot: {
      name: "Torso",
      catalogNameKey: "Label.Torso",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 48,
    name: "Climb Animation",
    type: "ClimbAnimation",
    catalogNameKey: "Label.ClimbAnimation",
    category: "animation",
    slot: {
      name: "ClimbAnimation",
      catalogNameKey: "Label.ClimbAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 49,
    name: "Death Animation",
    type: "DeathAnimation",
    catalogNameKey: "Label.DeathAnimation",
    category: "animation",
    slot: {
      name: "DeathAnimation",
      catalogNameKey: "Label.DeathAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 50,
    name: "Fall Animation",
    type: "FallAnimation",
    catalogNameKey: "Label.FallAnimation",
    category: "animation",
    slot: {
      name: "FallAnimation",
      catalogNameKey: "Label.FallAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 51,
    name: "Idle Animation",
    type: "IdleAnimation",
    catalogNameKey: "Label.IdleAnimation",
    category: "animation",
    slot: {
      name: "IdleAnimation",
      catalogNameKey: "Label.IdleAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 52,
    name: "Jump Animation",
    type: "JumpAnimation",
    catalogNameKey: "Label.JumpAnimation",
    category: "animation",
    slot: {
      name: "JumpAnimation",
      catalogNameKey: "Label.JumpAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 53,
    name: "Run Animation",
    type: "RunAnimation",
    catalogNameKey: "Label.RunAnimation",
    category: "animation",
    slot: {
      name: "RunAnimation",
      catalogNameKey: "Label.RunAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 54,
    name: "Swim Animation",
    type: "SwimAnimation",
    catalogNameKey: "Label.SwimAnimation",
    category: "animation",
    slot: {
      name: "SwimAnimation",
      catalogNameKey: "Label.SwimAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 55,
    name: "Walk Animation",
    type: "WalkAnimation",
    catalogNameKey: "Label.WalkAnimation",
    category: "animation",
    slot: {
      name: "WalkAnimation",
      catalogNameKey: "Label.WalkAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 56,
    name: "Pose Animation",
    type: "PoseAnimation",
    catalogNameKey: "Label.PoseAnimation",
    category: "animation",
    slot: {
      name: "PoseAnimation",
      catalogNameKey: "Label.PoseAnimation",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 0,
    id: 61,
    name: "Emote Animation",
    type: "EmoteAnimation",
    catalogNameKey: "Label.Emote",
    category: "animation",
    slot: {
      name: "EmoteAnimation",
      catalogNameKey: "Label.Emote",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 3,
    id: 8,
    name: "Hat",
    type: "Hat",
    catalogNameKey: "Label.Hat",
    category: "accessory",
    slot: {
      name: "HeadAccessory",
      catalogNameKey: "Label.AccessoryHead",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 41,
    name: "Hair Accessory",
    type: "HairAccessory",
    catalogNameKey: "Label.HairAccessory",
    category: "bodyPart",
    slot: {
      name: "HairAccessory",
      catalogNameKey: "Label.Hair",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 1,
    id: 42,
    name: "Face Accessory",
    type: "FaceAccessory",
    catalogNameKey: "Label.FaceAccessory",
    category: "accessory",
    slot: {
      name: "FaceAccessory",
      catalogNameKey: "Label.Face",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 43,
    name: "Neck Accessory",
    type: "NeckAccessory",
    catalogNameKey: "Label.NeckAccessory",
    category: "accessory",
    slot: {
      name: "NeckAccessory",
      catalogNameKey: "LabelAccessoryNeck",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 44,
    name: "Shoulder Accessory",
    type: "ShoulderAccessory",
    catalogNameKey: "Label.ShoulderAccessory",
    category: "accessory",
    slot: {
      name: "ShoulderAccessory",
      catalogNameKey: "LabelAccessoryShoulder",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 45,
    name: "Front Accessory",
    type: "FrontAccessory",
    catalogNameKey: "Label.FrontAccessory",
    category: "accessory",
    slot: {
      name: "FrontAccessory",
      catalogNameKey: "LabelAccessoryFront",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 46,
    name: "Back Accessory",
    type: "BackAccessory",
    catalogNameKey: "Label.BackAccessory",
    category: "accessory",
    slot: {
      name: "BackAccessory",
      catalogNameKey: "LabelAccessoryBack",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 47,
    name: "Waist Accessory",
    type: "WaistAccessory",
    catalogNameKey: "Label.WaistAccessory",
    category: "accessory",
    slot: {
      name: "WaistAccessory",
      catalogNameKey: "LabelAccessoryWaist",
      groupCatalogNameKey: "LabelAccessories",
    },
  },
  {
    maxNumber: 1,
    id: 72,
    name: "Dress Skirt Accessory",
    type: "DressSkirtAccessory",
    catalogNameKey: "Label.Skirt",
    category: "clothing",
    slot: {
      name: "Bottoms",
      catalogNameKey: "Label.Bottom",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 67,
    name: "Jacket Accessory",
    type: "JacketAccessory",
    catalogNameKey: "Label.Jacket",
    category: "clothing",
    slot: {
      name: "Outerwear",
      catalogNameKey: "Label.Outerwear",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 70,
    name: "Left Shoe Accessory",
    type: "LeftShoeAccessory",
    catalogNameKey: "Label.LeftShoe",
    category: "clothing",
    slot: {
      name: "Shoes",
      catalogNameKey: "Label.Clothing.ShoesBundles",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 71,
    name: "Right Shoe Accessory",
    type: "RightShoeAccessory",
    catalogNameKey: "Label.RightShoe",
    category: "clothing",
    slot: {
      name: "Shoes",
      catalogNameKey: "Label.Clothing.ShoesBundles",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 66,
    name: "Pants Accessory",
    type: "PantsAccessory",
    catalogNameKey: "Label.Clothing.PantsAccessories",
    category: "clothing",
    slot: {
      name: "Bottoms",
      catalogNameKey: "Label.Bottom",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 65,
    name: "Shirt Accessory",
    type: "ShirtAccessory",
    catalogNameKey: "Label.Shirt",
    category: "clothing",
    slot: {
      name: "Tops",
      catalogNameKey: "Label.Top",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 69,
    name: "Shorts Accessory",
    type: "ShortsAccessory",
    catalogNameKey: "Label.Clothing.ShortsAccessories",
    category: "clothing",
    slot: {
      name: "Bottoms",
      catalogNameKey: "Label.Bottom",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 68,
    name: "Sweater Accessory",
    type: "SweaterAccessory",
    catalogNameKey: "Label.Sweater",
    category: "clothing",
    slot: {
      name: "Tops",
      catalogNameKey: "Label.Top",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 64,
    name: "T-Shirt Accessory",
    type: "TShirtAccessory",
    catalogNameKey: "Label.TShirt",
    category: "clothing",
    slot: {
      name: "Tops",
      catalogNameKey: "Label.Top",
      groupCatalogNameKey: "Label.Clothing",
    },
  },
  {
    maxNumber: 1,
    id: 76,
    name: "Eyebrow Accessory",
    type: "EyebrowAccessory",
    blockUnequip: false,
    assetTypesToUnequip: [76],
    catalogNameKey: "Label.Eyebrow",
    category: "makeup",
    slot: {
      name: "Eyebrow",
      catalogNameKey: "",
      groupCatalogNameKey: "Label.Makeup",
    },
  },
  {
    maxNumber: 1,
    id: 77,
    name: "Eyelash Accessory",
    type: "EyelashAccessory",
    blockUnequip: false,
    assetTypesToUnequip: [77],
    catalogNameKey: "Label.Eyelash",
    category: "makeup",
    slot: {
      name: "Eyelash",
      catalogNameKey: "",
      groupCatalogNameKey: "Label.Makeup",
    },
  },
  {
    maxNumber: 1,
    id: 78,
    name: "Mood Animation",
    type: "MoodAnimation",
    catalogNameKey: "Label.MoodAnimation",
    category: "animation",
    slot: {
      name: "MoodAnimation",
      catalogNameKey: "",
      groupCatalogNameKey: "LabelAnimations",
    },
  },
  {
    maxNumber: 1,
    id: 79,
    name: "Dynamic Head",
    type: "DynamicHead",
    assetTypesToUnequip: [17, 76, 77, 78, 79],
    body: true,
    catalogNameKey: "Label.DynamicHead",
    category: "bodyPart",
    slot: {
      name: "Head",
      catalogNameKey: "",
      groupCatalogNameKey: "Label.Body",
    },
  },
  {
    maxNumber: 8,
    id: 88,
    name: "Face Makeup",
    type: "FaceMakeup",
    blockUnequip: false,
    assetTypesToUnequip: [],
    catalogNameKey: "Label.FaceMakeup",
    category: "makeup",
    slot: {
      name: "FaceMakeup",
      catalogNameKey: "Label.Face",
      groupCatalogNameKey: "Label.Makeup",
    },
  },
  {
    maxNumber: 8,
    id: 89,
    name: "Lip Makeup",
    type: "LipMakeup",
    blockUnequip: false,
    assetTypesToUnequip: [],
    catalogNameKey: "Label.LipMakeup",
    category: "makeup",
    slot: {
      name: "LipMakeup",
      catalogNameKey: "Label.LipMakeup",
      groupCatalogNameKey: "Label.Makeup",
    },
  },
  {
    maxNumber: 8,
    id: 90,
    name: "Eye Makeup",
    type: "EyeMakeup",
    blockUnequip: false,
    assetTypesToUnequip: [],
    catalogNameKey: "Label.EyeMakeup",
    category: "makeup",
    slot: {
      name: "EyeMakeup",
      catalogNameKey: "Label.EyeMakeup",
      groupCatalogNameKey: "Label.Makeup",
    },
  },
  // Profile Background is supported as a sales asset type, but is not a wearable
  // avatar accessory. It is intentionally omitted from any `category` so it does
  // not surface in avatar editor categories, and is filtered out of avatar
  // definitions / worn asset lists by the accoutrement rules service.
  {
    maxNumber: 1,
    id: 92,
    name: "Profile Background",
    type: "ProfileBackground",
    catalogNameKey: "Label.ProfileBackground",
    slot: {
      name: "ProfileBackground",
      catalogNameKey: "Label.ProfileBackground",
      groupCatalogNameKey: "",
    },
  },
];

const maxAccessories = 10;
const maxLayeredClothing = 5;

// Asset types that are recognized for sales/catalog purposes but must never be
// included in an avatar definition or worn assets list. Profile Background (92)
// has completely separate handling on the avatar/thumbnail try-on side.
const profileBackgroundAssetTypeId = 92;
const nonAvatarAssetTypeIds = [profileBackgroundAssetTypeId];

const avatarAssetTypeNames = {
  hat: "Hat",
  hairAccessory: "HairAccessory",
  faceAccessory: "FaceAccessory",
  neckAccessory: "NeckAccessory",
  shoulderAccessory: "ShoulderAccessory",
  frontAccessory: "FrontAccessory",
  backAccessory: "BackAccessory",
  waistAccessory: "WaistAccessory",
  climbAnimation: "ClimbAnimation",
  fallAnimation: "FallAnimation",
  jumpAnimation: "JumpAnimation",
  runAnimation: "RunAnimation",
  swimAnimation: "SwimAnimation",
  walkAnimation: "WalkAnimation",
  emoteAnimation: "EmoteAnimation",
  idleAnimation: "IdleAnimation",
  dynamicHead: "DynamicHead",
  hairAccessoryName: "Hair Accessory",
  faceAccessoryName: "Face Accessory",
  neckAccessoryName: "Neck Accessory",
  shoulderAccessoryName: "Shoulder Accessory",
  frontAccessoryName: "Front Accessory",
  backAccessoryName: "Back Accessory",
  waistAccessoryName: "Waist Accessory",
  climbAnimationName: "Climb Animation",
  fallAnimationName: "Fall Animation",
  jumpAnimationName: "Jump Animation",
  runAnimationName: "Run Animation",
  swimAnimationName: "Swim Animation",
  walkAnimationName: "Walk Animation",
  emoteAnimationName: "Emote Animation",
  idleAnimationName: "Idle Animation",
  dynamicHeadName: "Dynamic Head",
  profileBackground: "ProfileBackground",
  profileBackgroundName: "Profile Background",
};

// This is less than ideal, but might be changed later when we split these asset types into their own categories
// If not, this should eventually be moved into avatar-rules or metadata
const layeredClothingGroups = {
  64: "Tops", // T Shirt Accessory
  65: "Tops", // Shirt Accessory
  66: "Bottoms", // Pants Accessory
  69: "Bottoms", // Shorts Accessory
  72: "Bottoms", // Dress Skirt Accessory
  67: "Outerwear", // Jacket Accessory
  68: "Tops", // Sweater Accessory
  88: "GeneralMakeup", // Face Makeup
  89: "GeneralMakeup", // Lip Makeup
  90: "GeneralMakeup", // Eye Makeup
};

const layeredClothingGroupLimits = {
  Tops: 1,
  Bottoms: 1,
  Outerwear: 1,
  GeneralMakeup: 6,
};

const layeredClothingAssetOrder = {
  76: 0, // Eyebrow Accessory
  77: 1, // Eyelash Accessory
  /*
  // These may be used in the future, keeping they layers open
  12: 2, // Classic Pants
  11: 3, // Classic Shirt
  2: 4, // Classic TShirt
  */
  70: 5, // Left Shoe
  71: 5, // Right Shoe
  66: 6, // Layered Pants (i.e. Pants Accessory)
  69: 7, // Shorts Accessory
  72: 8, // Dress Skirt Accessory
  64: 9, // Layered TShirt (i.e. TShirt Accessory)
  65: 10, // Layered Shirt (i.e. Shirt Accessory)
  68: 11, // Sweater Accessory
  67: 12, // Jacket Accessory
  41: 13, // Hair (i.e. Hair Accessory)
};

const layeredClothingOrderOffset = 5;

const advancedEditorLimits = {
  41: 2, // Hair
};

const dnaLayeredAccessories = [41, 76, 77];

export {
  wearableAssetTypes,
  maxAccessories,
  maxLayeredClothing,
  avatarAssetTypeNames,
  layeredClothingGroups,
  layeredClothingGroupLimits,
  layeredClothingAssetOrder,
  advancedEditorLimits,
  dnaLayeredAccessories,
  layeredClothingOrderOffset,
  profileBackgroundAssetTypeId,
  nonAvatarAssetTypeIds,
};
