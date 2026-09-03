import { ClassicHeadAssetSlot, OutfitDetails } from "../types";

export const DEFAULT_CLASSIC_HEAD: ClassicHeadAssetSlot = {
  id: 2432102561,
  thumbnailType: "Asset",
} as ClassicHeadAssetSlot;

export const avatarConstants = {
  events: {
    avatarDetailsLoaded: "Roblox.Avatar.AvatarDetailsLoaded",
    avatarRulesLoaded: "Roblox.Avatar.AvatarRulesLoaded",
    menuClicked: "Roblox.Avatar.MenuClicked",
    submenuClicked: "Roblox.Avatar.SubmenuClicked",
    outfitsEquipped: "Roblox.Avatar.OutfitsEquipped",
    outfitsChanged: "Roblox.Avatar.OutfitsChanged",
    outfitDeleted: "Roblox.Avatar.OutfitDeleted",
    wornAssetsChanged: "Roblox.Avatar.WornAssetsChanged",
    metaDataLoaded: "Roblox.Avatar.MetaDataLoaded",
    bodyColorsChanged: "Roblox.Avatar.BodyColorsChanged",
    pageLoaded: "Roblox.Avatar.PageLoaded",
    avatarTypeChanged: "Roblox.Avatar.AvatarTypeChanged",
  },
  page: {
    errorLoadingPage: "Message.PageUnavailable",
    idleRefreshTimeInSeconds: 10,
    avatarEditingDisabled: "Message.AvatarEditingDisabled",
  },
  thumbnail: {
    redrawFloodchecked: "Message.RedrawFloodchecked",
    redrawThumbnailFailed: "Message.RedrawThumbnailFailed",
    waitForThumbnailRegenerationInSeconds: 30,
    useThreeDeeThumbsKey: "RobloxUse3DThumbnailsV2",
    threeDeeButton: "Action.ThreeDimensions",
    twoDeeButton: "Action.TwoDimensions",
  },
  recent: {
    couldNotLoadList: "Message.FailedLoadRecent",
    emptyMessage: "Message.EmptyRecentItems",
  },
  outfits: {
    createNewOutfit(outfitType: string): string {
      if (outfitType === "Outfit") {
        return "Heading.CreateNewCharacter";
      }
      return "Heading.CreateNewCostume";
    },
    outfitMessages: {
      // TODO: once Costumes/bundles are official, then refactor. See AV-2083.
      renameOutfitTitle: "Heading.RenameOutfit",
      renameOutfitDescription: "Description.RenameOutfit",
      renameOutfitButton: "Action.Rename", // same string value in both outfit and costume
      createOutfitTitle: "Heading.CreateNewOutfit",
      createOutfitDescription: "Description.CreateNewOutfit",
      createOutfitButton: "Action.CreateNewOutfit", // same string value in both outfit and costume
      successfulRename: "Message.SuccessRenameOutfit",
      successfulDelete: "Message.SuccessDeleteOutfit",
      successfulUpdate: "Message.SuccessUpdatedOutfit",
      successfulCreate: "Message.SuccessCreateOutfit",
      successfulWear: "Message.SuccessWoreOutfit",
      emptyMessage: "Message.EmptyListOfOutfits",
      maxNumberOfOutfits: "Message.ReachedMaxOutfits",
      errorCreatingOutfit: "Message.ErrorCreateOutfit",
      invalidOutfitName: "Message.InvalidOutfitName", // same string value in both outfit and costume
      updateFailedOutfitDelete: "Message.FailedUpdateDeletedOutfit",
      errorUpdatingOutfit: "Message.ErrorUpdateOutfit",
      errorDeletingOutfit: "Message.FailedDeleteOutfit",
      errorRenamingOutfit: "Message.ErrorRenameOutfit",
      errorWearingOutfit: "Message.ErrorWearOutfit",
      failedToLoadOutfits: "Message.ErrorLoadOutfits",
      nameInputPlaceholder: "Label.NamePlaceholderOutfit",
    },
    costumeMessages: {
      renameOutfitTitle: "Heading.RenameCostume",
      renameOutfitDescription: "Description.RenameCostume",
      renameOutfitButton: "Action.Rename", // same string value in both outfit and costume
      createOutfitTitle: "Heading.CreateNewCostume",
      createOutfitDescription: "Description.CreateNewCostume",
      createOutfitButton: "Action.CreateNewOutfit", // same string value in both outfit and costume
      successfulRename: "Message.SuccessRenameCostume",
      successfulDelete: "Message.SuccessDeleteCostume",
      successfulUpdate: "Message.SuccessUpdatedCostume",
      successfulCreate: "Message.SuccessCreateCostume",
      successfulWear: "Message.SuccessWoreCostume",
      emptyMessage: "Message.EmptyListOfCostumes",
      maxNumberOfOutfits: "Message.ReachedMaxCostumes",
      errorCreatingOutfit: "Message.ErrorCreateCostume",
      invalidOutfitName: "Message.InvalidOutfitName", // same string value in both outfit and costume
      updateFailedOutfitDelete: "Message.FailedUpdateDeletedCostume",
      errorUpdatingOutfit: "Message.ErrorUpdateCostume",
      errorDeletingOutfit: "Message.FailedDeleteCostume",
      errorRenamingOutfit: "Message.ErrorRenameCostume",
      errorWearingOutfit: "Message.ErrorWearCostume",
      failedToLoadOutfits: "Message.ErrorLoadCostume",
      nameInputPlaceholder: "Label.NamePlaceholderCostume",
    },
    characterMessages: {
      renameOutfitTitle: "Heading.RenameCharacter",
      renameOutfitDescription: "Description.RenameCharacter",
      renameOutfitButton: "Action.Rename", // same string value in both outfit and costume
      createOutfitTitle: "Heading.CreateNewCharacter",
      createOutfitDescription: "Description.CreateNewCharacter",
      createOutfitButton: "Action.CreateNewOutfit", // same string value in both outfit and costume
      successfulRename: "Message.SuccessRenameCharacter",
      successfulDelete: "Message.SuccessDeleteCharacter",
      successfulUpdate: "Message.SuccessUpdatedCharacter",
      successfulCreate: "Message.SuccessCreateCharacter",
      successfulWear: "Message.SuccessWoreCharacter",
      emptyMessage: "Message.EmptyListOfCharacters",
      maxNumberOfOutfits: "Message.ReachedMaxCharacters",
      errorCreatingOutfit: "Message.ErrorCreateCharacter",
      invalidOutfitName: "Message.InvalidOutfitName", // same string value in both outfit and costume
      updateFailedOutfitDelete: "Message.FailedUpdateDeletedCharacter",
      errorUpdatingOutfit: "Message.ErrorUpdateCharacter", // need to add 'Message.ErrorUpdateCharacter'
      errorDeletingOutfit: "Message.FailedDeleteCharacter", // need to add 'Message.FailedDeleteCharacter'
      errorRenamingOutfit: "Message.ErrorRenameCharacter",
      errorWearingOutfit: "Message.ErrorWearCharacter",
      failedToLoadOutfits: "Message.ErrorLoadCharacter",
      nameInputPlaceholder: "Label.NamePlaceholderCharacter",
    },
    countNumbersInEnglish: ["zero", "one", "two", "three", "four", "five"],
    menuOptions: [
      { label: "Action.Update", name: "Update" },
      { label: "Action.Rename", name: "Rename" },
      { label: "Action.Delete", name: "Delete" },
      { label: "Action.Cancel", name: "Cancel" },
    ],
    outfitErrorCodes: {
      maxOutfits: 1,
      invalidBodyColors: 3,
      createOutfitInvalidOutfitName: 4,
      renameOutfitInvalidOutfitName: 0,
      unwearableAsset: 5,
      internalError: 6,
    },
  },
  packages: {
    errorWearingPackage: "Message.FailedWearPackage",
  },
  assets: {
    savedAdvancedAccessories: "Message.SuccessSavedAccessories",
    // emptyMessage(type: string) {
    //   return 'Message.EmptyListForItem', { itemType: type };
    // },
    couldNotLoadList: "Message.FailedLoadAssets",
    errorUpdatingItems: "Message.ErrorUpdateWorn",
    maxAccessories: 10,
  },
  scales: {
    failedToUpdate: "Message.FailedUpdateScales",
  },
  avatarType: {
    failedToUpdate: "Message.FailedUpdateType",
    defaultOnPageLoad: "R15",
    avatarTypes: ["R6", "R15"],
  },
  bodyColors: {
    failedToUpdate: "Message.FailedUpdateBodyColor",
    palette: [
      { brickColorId: 364, hexColor: "#5A4C42" },
      { brickColorId: 217, hexColor: "#7C5C46" },
      { brickColorId: 359, hexColor: "#AF9483" },
      { brickColorId: 18, hexColor: "#CC8E69" },
      { brickColorId: 125, hexColor: "#EAB892" },
      { brickColorId: 361, hexColor: "#564236" },
      { brickColorId: 192, hexColor: "#694028" },
      { brickColorId: 351, hexColor: "#BC9B5D" },
      { brickColorId: 352, hexColor: "#C7AC78" },
      { brickColorId: 5, hexColor: "#D7C59A" },
      { brickColorId: 153, hexColor: "#957977" },
      { brickColorId: 1007, hexColor: "#A34B4B" },
      { brickColorId: 101, hexColor: "#DA867A" },
      { brickColorId: 1025, hexColor: "#FFC9C9" },
      { brickColorId: 330, hexColor: "#FF98DC" },
      { brickColorId: 135, hexColor: "#74869D" },
      { brickColorId: 305, hexColor: "#527CAE" },
      { brickColorId: 11, hexColor: "#80BBDC" },
      { brickColorId: 1026, hexColor: "#B1A7FF" },
      { brickColorId: 321, hexColor: "#A75E9B" },
      { brickColorId: 107, hexColor: "#008F9C" },
      { brickColorId: 310, hexColor: "#5B9A4C" },
      { brickColorId: 317, hexColor: "#7C9C6B" },
      { brickColorId: 29, hexColor: "#A1C48C" },
      { brickColorId: 105, hexColor: "#E29B40" },
      { brickColorId: 24, hexColor: "#F5CD30" },
      { brickColorId: 334, hexColor: "#F8D96D" },
      { brickColorId: 199, hexColor: "#635F62" },
      { brickColorId: 1002, hexColor: "#CDCDCD" },
      { brickColorId: 1001, hexColor: "#F8F8F8" },
    ],
  },
  bodyParts: {
    all: "Label.All",
    head: "Label.Head",
    torso: "Label.Torso",
    leftArm: "Label.LeftArm",
    rightArm: "Label.RightArm",
    leftLeg: "Label.LeftLeg",
    rightLeg: "Label.RightLeg",
  },
  bodyScaling: {
    height: "Label.Height",
    width: "Label.Width",
    head: "Label.Head",
    bodyType: "Label.BodyType",
    proportions: "Label.Proportions",
  },
  bodyScalingType: {
    height: "Height",
    width: "Width",
    head: "Head",
    bodyType: "BodyType",
    proportions: "Proportions",
  },
  googleAnalytics: {
    category: "AvatarPage",
    advancedAccessoriesAction: "AdvancedAccessories",
    advancedBodyColorsAction: "AdvancedBodyColors",
    openLabel: "Open",
    closeLabel: "Close",
    saveLabel: "Save",
    saveFailedLabel: "SaveFailed",
  },
  defaultClothing: {
    wearClothing: "Message.DefaultClothing",
    displayTimeInMilliseconds: 5000,
  },
  modalLayout: {
    outfitUpdate: {
      titlePrefix(outfitType: string): string {
        if (outfitType === "Outfit") {
          return "Heading.UpdateCharacter";
        }
        return "Heading.UpdateCostume";
      },
      bodyText(outfitType: string): string {
        if (outfitType === "Outfit") {
          return "Message.UpdateThisCharacter";
        }
        return "Message.UpdateThisCostume";
      },
      confirmBtnName: "Action.Update",
      cancelBtnName: "Action.Cancel",
      confirmBtnId: "purchaseConfirm",
    },
    outfitDelete: {
      titlePrefix(outfitType: string): string {
        if (outfitType === "Outfit") {
          return "Heading.DeleteCharacterTitle";
        }
        return "Heading.DeleteCostume";
      },
      bodyText(outfitType: string): string {
        if (outfitType === "Outfit") {
          return "Message.DeleteThisCharacter";
        }
        return "Message.DeleteThisCostume";
      },
      confirmBtnName: "Action.Delete",
      cancelBtnName: "Action.Cancel",
      confirmBtnId: "purchaseConfirm",
    },
    advancedAccessoriesDoubleCheck: {
      title: "Heading.AccessoriesChange",
      bodyText: "Message.AccessoriesChange",
      confirmBtnName: "Action.Save",
      cancelBtnName: "Action.Cancel",
    },
  },
  emotes: {
    assetType: "Emote Animation",
    emotesInstructions: "Message.EmotesInstructions",
    successfulDelete: "Message.SuccessUnequipEmote",
    successfulUpdate: "Message.SuccessEquipEmote",
    errorUpdatingEmote: "Message.ErrorEquipEmote",
    errorDeletingEmote: "Message.ErrorDeleteEmote",
    errorGettingEmotes: "Message.ErrorLoadEmotes",
  },
  bodyColorEvents: {
    event: "avatarChanged",
    avatarChangeType: "SetBodyColors",
    contextWholeBody: "WholeBodySkinTone",
    contextAdvanced: "AdvancedSkinTone",
  },
  bodyTypeWarning: {
    r15Upgrade: {
      title: "Title.UnableToEquip",
      description: "Label.LayeredClothingR15Warning",
      action: "Action.Update",
    },
    r6Downgrade: {
      title: "Message.Warning",
      description: "Label.LayeredClothingSwitchR6Warning",
      action: "Action.Switch",
    },
  },
  layeredClothingLimit: {
    title: "Title.UnableToEquip",
    description: "Title.LCLimit",
    action: "Action.Close",
  },
  itemTypes: {
    bundle: "Bundle",
    asset: "Asset",
  },
  itemRestrictionTypes: {
    thirteenPlus: "ThirteenPlus",
    limitedUnique: "LimitedUnique",
    limited: "Limited",
    rthro: "Rthro",
    dynamicHead: "Live",
    collectible: "Collectible",
  },
  itemRestrictionIcons: {
    thirteenPlus: "icon-thirteen-plus-label",
    limited: "icon-limited-label",
    limitedUnique: "icon-limited-unique-label",
    thirteenPlusLimited: "icon-thirteen-plus-limited-label",
    thirteenPlusLimitedUnique: "icon-thirteen-plus-limited-unique-label",
    rthroLabel: "icon-rthro-label",
    rthroLimitedLabel: "icon-rthro-limited-label",
    dynamicHead: "",
    collectible: "icon-limited-unique-label",
  },
  outfitSettings: {
    DynamicHead: {
      assetTypesToUnequip: [17, 76, 77, 78, 79],
      showSelectedOutfit: true,
    },
    Avatar: {
      showSelectedOutfit: false,
    },
  },
  classicHeads: [
    { assetId: 746767604 },
    { assetId: 746774687 },
    { assetId: 616399508 },
    { assetId: 616398268 },
    { assetId: 616387160 },
    { assetId: 6340213 },
    { assetId: 6340227 },
    { assetId: 6340101 },
  ],
  itemTypeIds: {
    asset: 0,
    bundle: 3,
  },
};

export type OutfitSettingsType = {
  showSelectedOutfit: boolean;
  assetTypesToUnequip?: number[];
  skipBodyColors?: boolean;
  skipBodyScale?: boolean;
  // When true, equipping this outfit type leaves the profile background untouched. Partial
  // looks (shoes, makeup, dynamic heads) only apply a subset of the avatar, so they should
  // not clobber the equipped background; only full "Avatar" outfits carry/apply a background.
  skipBackground?: boolean;
};

export const OUTFIT_SETTINGS: Record<OutfitDetails["outfitType"], OutfitSettingsType> = {
  DynamicHead: {
    assetTypesToUnequip: [17, 76, 77, 78, 79],
    showSelectedOutfit: true,
    skipBodyColors: true,
    skipBodyScale: true,
    skipBackground: true,
  },
  Avatar: {
    showSelectedOutfit: false,
  },
  Shoes: {
    showSelectedOutfit: true,
    skipBackground: true,
  },
  Makeup: {
    assetTypesToUnequip: [77, 76, 88, 89, 90],
    showSelectedOutfit: true,
    skipBodyColors: true,
    skipBodyScale: true,
    skipBackground: true,
  },
};

export const OUTFIT_COSTUME_MESSAGES = {
  renameOutfitTitle: "Heading.RenameCharacter",
  renameOutfitDescription: "Description.RenameCharacter",
  renameOutfitButton: "Action.Rename", // same string value in both outfit and costume
  createOutfitTitle: "Heading.CreateNewCharacter",
  createOutfitDescription: "Description.CreateNewCharacter",
  createOutfitButton: "Action.CreateNewOutfit", // same string value in both outfit and costume
  successfulRename: "Message.SuccessRenameCharacter",
  successfulDelete: "Message.SuccessDeleteCharacter",
  successfulUpdate: "Message.SuccessUpdatedCharacter",
  successfulCreate: "Message.SuccessCreateCharacter",
  successfulWear: "Message.SuccessWoreCharacter",
  emptyMessage: "Message.EmptyListOfCharacters",
  maxNumberOfOutfits: "Message.ReachedMaxCharacters",
  errorCreatingOutfit: "Message.ErrorCreateCharacter",
  invalidOutfitName: "Message.InvalidOutfitName", // same string value in both outfit and costume
  updateFailedOutfitDelete: "Message.FailedUpdateDeletedCharacter",
  errorUpdatingOutfit: "Message.ErrorUpdateCharacter", // need to add 'Message.ErrorUpdateCharacter'
  errorDeletingOutfit: "Message.FailedDeleteCharacter", // need to add 'Message.FailedDeleteCharacter'
  errorRenamingOutfit: "Message.ErrorRenameCharacter",
  errorWearingOutfit: "Message.ErrorWearCharacter",
  failedToLoadOutfits: "Message.ErrorLoadCharacter",
  nameInputPlaceholder: "Label.NamePlaceholderCharacter",
};

export default avatarConstants;
