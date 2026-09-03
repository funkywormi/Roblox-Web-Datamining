import { Tab } from "../types/avatarTab.types";

const avatarEditorTabs: Tab[] = [
  {
    label: "Heading.Recent",
    name: "Recent",
    subCategoryMenu: [
      {
        name: "RecentlyAcquired",
        label: "Heading.RecentlyAcquired",
        avatarInventoryRequest: {
          sortOption: "recentAdded",
          category: undefined,
          itemCategories: undefined,
        },
      },
      {
        name: "RecentlyWorn",
        label: "Heading.RecentlyWorn",
        avatarInventoryRequest: {
          sortOption: 2,
          category: undefined,
          itemCategories: undefined,
        },
      },
      {
        name: "Accessories",
        label: "Heading.Accessories",
        avatarInventoryRequest: {
          sortOption: "recentEquipped",
          category: "accessory",
          itemCategories: undefined,
        },
      },
      {
        name: "Clothing",
        label: "Heading.Clothing",
        avatarInventoryRequest: {
          sortOption: "recentEquipped",
          category: "clothing",
          itemCategories: undefined,
        },
      },
      {
        name: "BodyParts",
        label: "Heading.BodyParts",
        avatarInventoryRequest: {
          sortOption: "recentEquipped",
          category: "bodyPart",
          itemCategories: undefined,
          subTypeBlacklist: [76, 77, 79],
        },
      },
      {
        name: "AvatarAnimations",
        label: "Heading.Animations",
        avatarInventoryRequest: {
          sortOption: "recentEquipped",
          category: "animation",
          itemCategories: undefined,
          subTypeBlacklist: [49, 56, 78],
        },
      },
      {
        name: "Outfits",
        label: "Heading.Characters",
        avatarInventoryRequest: {
          sortOption: "recentEquipped",
          category: undefined,
          itemCategories: [{ itemType: "Outfit", itemSubType: 1 }],
        },
      },
      {
        name: "Expired",
        label: "Heading.Expired",
        avatarInventoryRequest: {
          sortOption: "recentadded",
          category: undefined,
          itemCategories: undefined,
          availabilityStatus: 2,
        },
        emptyMessage: "Message.NoExpiredItems",
      },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: undefined,
      itemCategories: undefined,
    },
  },
  {
    label: "Label.Avatars",
    name: "Outfits",
    tabType: "Costumes",
    subCategoryMenu: [
      {
        name: "PresetCostumes",
        label: "Label.Purchased",
        fullLabel: "Label.Purchased",
        bundleRecommendationType: 1,
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [
            { itemType: "Outfit", itemSubType: 1 },
            { itemType: "Outfit", itemSubType: 5 },
          ],
        },
      },
      {
        name: "MyCostumes",
        label: "Label.Creations",
        fullLabel: "Label.Creations",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Outfit", itemSubType: 3 }],
        },
      },
    ],
    visible: true,
    avatarInventoryRequest: {
      sortOption: 1,
      category: undefined,
      itemCategories: [
        { itemType: "Outfit", itemSubType: 1 },
        { itemType: "Outfit", itemSubType: 3 },
      ],
    },
  },
  {
    label: "Heading.Body",
    labelShort: "Heading.Body",
    name: "Body",
    tabType: "Assets",
    subCategoryMenu: [
      {
        name: "DynamicHeads",
        label: "Label.Heads",
        fullLabel: "Label.Heads",
        bundleRecommendationType: 4,
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Outfit", itemSubType: 2 }],
        },
      },
      {
        name: "BodyColors",
        label: "Label.SkinTone",
        fullLabel: "Label.SkinTone",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 17 }],
        },
      },
      {
        name: "Hair",
        label: "Label.Hair",
        fullLabel: "Label.HairAccessories",
        assetType: "Hair Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 41 }],
        },
      },
      {
        name: "Torso",
        label: "Label.Torso",
        assetType: "Torso",
        fullLabel: "Label.Torsos",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 27 }],
        },
      },
      {
        name: "LeftArms",
        label: "Label.LeftArms",
        assetType: "Left Arm",
        fullLabel: "Label.LeftArms",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 29 }],
        },
      },
      {
        name: "RightArms",
        label: "Label.RightArms",
        assetType: "Right Arm",
        fullLabel: "Label.RightArms",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 28 }],
        },
      },
      {
        name: "LeftLegs",
        label: "Label.LeftLegs",
        assetType: "Left Leg",
        fullLabel: "Label.LeftLegs",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 30 }],
        },
      },
      {
        name: "RightLegs",
        label: "Label.RightLegs",
        assetType: "Right Leg",
        fullLabel: "Label.RightLegs",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 31 }],
        },
      },
      { name: "Scale", label: "Label.Scale", visible: true, avatarInventoryRequest: undefined },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: "bodyPart",
      itemCategories: undefined,
      subTypeBlacklist: [76, 77, 79],
    },
  },
  {
    label: "Label.Makeup",
    name: "Makeup",
    tabType: "Assets",
    subCategoryMenu: [
      {
        name: "Looks",
        label: "Label.Looks",
        fullLabel: "Label.Looks",
        bundleRecommendationType: 4,
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [
            { itemType: "Outfit", itemSubType: 6 },
            { itemType: "Outfit", itemSubType: 7 },
          ],
        },
      },
      {
        name: "Eyes",
        label: "Label.EyeMakeup",
        fullLabel: "Label.EyeMakeup",
        assetType: "EyeMakeup",
        slotConfigId: "makeup",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 90 }],
        },
      },
      {
        name: "Face",
        label: "Label.Face",
        fullLabel: "Label.Face",
        assetType: "FaceMakeup",
        slotConfigId: "makeup",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 88 }],
        },
      },
      {
        name: "Lips",
        label: "Label.LipMakeup",
        fullLabel: "Label.LipMakeup",
        assetType: "LipMakeup",
        slotConfigId: "makeup",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 89 }],
        },
      },
      {
        name: "Eyelashes",
        label: "Label.Eyelashes",
        fullLabel: "Label.Eyelashes",
        assetType: "Eyelash",
        slotConfigId: "makeup",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 77 }],
        },
      },
      {
        name: "Eyebrows",
        label: "Label.Eyebrows",
        fullLabel: "Label.Eyebrows",
        assetType: "Eyebrow",
        slotConfigId: "makeup",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 76 }],
        },
      },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: "makeup",
      itemCategories: undefined,
    },
  },
  {
    label: "Heading.Clothing",
    name: "Clothing",
    tabType: "Assets",
    menuType: "Nested",
    categoryRows: [
      {
        title: "Label.Tops",
        name: "Tops",
        subCategoryMenu: [
          {
            name: "T-Shirts",
            label: "Label.TShirts",
            fullLabel: "Label.TShirts",
            assetType: "T-Shirt Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 64 }],
            },
          },
          {
            name: "Shirts",
            label: "Label.Shirts",
            fullLabel: "Label.Shirts",
            assetType: "Shirt Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 65 }],
            },
          },
          {
            name: "Sweater",
            label: "Label.Sweaters",
            fullLabel: "Label.Sweaters",
            assetType: "Sweater Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 68 }],
            },
          },
        ],
        showLayeredClothingSlots: true,
        slotConfigId: "layeredClothing",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [
            { itemType: "Asset", itemSubType: 64 },
            { itemType: "Asset", itemSubType: 65 },
            { itemType: "Asset", itemSubType: 68 },
          ],
        },
      },
      {
        title: "Label.Outerwear",
        name: "Outerwear",
        subCategoryMenu: [
          {
            name: "Jackets",
            label: "Label.Jackets",
            fullLabel: "Label.Jackets",
            assetType: "Jacket Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 67 }],
            },
          },
        ],
        showLayeredClothingSlots: true,
        slotConfigId: "layeredClothing",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 67 }],
        },
      },
      {
        title: "Label.Bottoms",
        name: "Bottoms",
        subCategoryMenu: [
          {
            name: "Pants",
            label: "Label.Pants",
            fullLabel: "Label.Pants",
            assetType: "Pants Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 66 }],
            },
          },
          {
            name: "Shorts",
            label: "Label.Shorts",
            fullLabel: "Label.Shorts",
            assetType: "Shorts Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 69 }],
            },
          },
          {
            name: "Skirts",
            label: "Label.DressesAndSkirts",
            fullLabel: "Label.DressesAndSkirts",
            assetType: "Dress Skirt Accessory",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 72 }],
            },
          },
        ],
        showLayeredClothingSlots: true,
        slotConfigId: "layeredClothing",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [
            { itemType: "Asset", itemSubType: 66 },
            { itemType: "Asset", itemSubType: 69 },
            { itemType: "Asset", itemSubType: 72 },
          ],
        },
      },
      {
        title: "Label.Shoes",
        name: "Shoes",
        subCategoryMenu: [
          {
            name: "Left Shoe",
            label: "Label.LeftShoes",
            fullLabel: "Label.LeftShoes",
            assetType: "Left Shoe Accessory",
            bundleRecommendationType: 3,
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 70 }],
            },
          },
          {
            name: "Right Shoe",
            label: "Label.RightShoes",
            fullLabel: "Label.RightShoes",
            assetType: "Right Shoe Accessory",
            bundleRecommendationType: 3,
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 71 }],
            },
          },
        ],
        showLayeredClothingSlots: true,
        slotConfigId: "layeredClothing",
        bundleRecommendationType: 3,
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Outfit", itemSubType: 4 }],
        },
      },
      {
        title: "Label.Classic",
        name: "Classic",
        subCategoryMenu: [
          {
            name: "Shirts",
            label: "Label.ClassicShirts",
            fullLabel: "Label.ClassicShirts",
            assetType: "Shirt",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 11 }],
            },
          },
          {
            name: "Pants",
            label: "Label.ClassicPants",
            fullLabel: "Label.ClassicPants",
            assetType: "Pants",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 12 }],
            },
          },
          {
            name: "T-Shirts",
            label: "Label.ClassicTShirts",
            fullLabel: "Label.ClassicTShirts",
            assetType: "T-Shirt",
            avatarInventoryRequest: {
              sortOption: 1,
              category: undefined,
              itemCategories: [{ itemType: "Asset", itemSubType: 2 }],
            },
          },
        ],
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [
            { itemType: "Asset", itemSubType: 11 },
            { itemType: "Asset", itemSubType: 12 },
            { itemType: "Asset", itemSubType: 2 },
          ],
        },
      },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: "accessory",
      itemCategories: undefined,
    },
  },
  {
    label: "Heading.Accessories",
    name: "Accessories",
    tabType: "Assets",
    slotConfigId: "accessories",
    subCategoryMenu: [
      {
        name: "Hats",
        label: "Label.Head",
        fullLabel: "Label.Head",
        assetType: "Hat",
        slotConfigId: "hats",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 8 }],
        },
      },
      {
        name: "Face",
        label: "Label.Face",
        fullLabel: "Label.FaceAccessories",
        assetType: "Face Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 42 }],
        },
      },
      {
        name: "Neck",
        label: "Label.Neck",
        fullLabel: "Label.NeckAccessories",
        assetType: "Neck Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 43 }],
        },
      },
      {
        name: "Shoulder",
        label: "Label.Shoulders",
        fullLabel: "Label.ShoulderAccessories",
        assetType: "Shoulder Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 44 }],
        },
      },
      {
        name: "Front",
        label: "Label.Front",
        fullLabel: "Label.FrontAccessories",
        assetType: "Front Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 45 }],
        },
      },
      {
        name: "Back",
        label: "Label.Back",
        fullLabel: "Label.BackAccessories",
        assetType: "Back Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 46 }],
        },
      },
      {
        name: "Waist",
        label: "Label.Waist",
        fullLabel: "Label.WaistAccessories",
        assetType: "Waist Accessory",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 47 }],
        },
      },
      {
        name: "Gear",
        label: "Label.Gear",
        fullLabel: "Label.Gear",
        assetType: "Gear",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 19 }],
        },
      },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: "accessory",
      itemCategories: undefined,
    },
  },
  {
    // Profile Backgrounds (asset type 92). High-level, single-asset-type category.
    // Browse-only for now: backgrounds are intentionally filtered out of avatar
    // definitions and have separate handling on the avatar/thumbnail try-on side.
    label: "Backgrounds.Title",
    name: "Backgrounds",
    tabType: "Assets",
    noSubCategoryMenu: true,
    avatarInventoryRequest: {
      sortOption: 1,
      category: undefined,
      itemCategories: [{ itemType: "Asset", itemSubType: 92 }],
    },
  },
  {
    label: "Heading.Animations",
    name: "AvatarAnimations",
    tabType: "Assets",
    subCategoryMenu: [
      {
        name: "Emote",
        label: "Heading.Emotes",
        fullLabel: "Heading.Emotes",
        assetType: "Emote Animation",
        visible: true,
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 61 }],
        },
      },
      {
        name: "Walk",
        label: "Label.Walk",
        fullLabel: "Label.WalkAnimations",
        assetType: "Walk Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 55 }],
        },
      },
      {
        name: "Run",
        label: "Label.Run",
        fullLabel: "Label.RunAnimations",
        assetType: "Run Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 53 }],
        },
      },
      {
        name: "Fall",
        label: "Label.Fall",
        fullLabel: "Label.FallAnimations",
        assetType: "Fall Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 50 }],
        },
      },
      {
        name: "Jump",
        label: "Label.Jump",
        fullLabel: "Label.JumpAnimations",
        assetType: "Jump Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 52 }],
        },
      },
      {
        name: "Swim",
        label: "Label.Swim",
        fullLabel: "Label.SwimAnimations",
        assetType: "Swim Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 54 }],
        },
      },
      {
        name: "Climb",
        label: "Label.Climb",
        fullLabel: "Label.ClimbAnimations",
        assetType: "Climb Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 48 }],
        },
      },
      {
        name: "Idle",
        label: "Label.Idle",
        fullLabel: "Label.IdleAnimations",
        assetType: "Idle Animation",
        avatarInventoryRequest: {
          sortOption: 1,
          category: undefined,
          itemCategories: [{ itemType: "Asset", itemSubType: 51 }],
        },
      },
    ],
    avatarInventoryRequest: {
      sortOption: 1,
      category: "animation",
      itemCategories: undefined,
      subTypeBlacklist: [49, 56, 78],
    },
  },
];

export default avatarEditorTabs;
