import React from "react";
import AvatarAccoutrementService from "../utils/avatarAccoutrementService";
import { Icon } from "@rbx/foundation-ui";
import { SlotConfiguration } from "../types";

export const SLOT_CONFIGS: Record<string, SlotConfiguration> = {
  hats: {
    id: "hats",
    maxSlots: 3,
    assetFilter: asset => asset.assetType.name === "Hat",
    cssClass: "slots",
    tooltipKey: "Message.HatLimitTooltip",
    emptySlotIcon: <Icon name="icon-regular-hat-fedora" size="XLarge" />,
  },
  accessories: {
    id: "accessories",
    maxSlots: AvatarAccoutrementService.maxNumberOfAdvancedAccessoryItems ?? 10,
    assetFilter: asset => AvatarAccoutrementService.isAccessoryType(asset.assetType.name),
    cssClass: "slots accessory-slots",
    tooltipKey: "Message.HatLimitTooltip",
  },
  layeredClothing: {
    id: "layeredClothing",
    maxSlots: AvatarAccoutrementService.maxNumberOfLayeredClothingItems ?? 5,
    assetFilter: asset => AvatarAccoutrementService.isLayeredClothing(asset.assetType.id, true),
    showReorderControls: true,
    cssClass: "layered-clothing-slots",
    tooltipKey: "Message.LCSortEntry",
  },
  makeup: {
    id: "makeup",
    maxSlots: 6,
    assetFilter: asset => {
      const makeupAssetTypes = [
        "Eye Makeup",
        "Face Makeup",
        "Lip Makeup",
        "EyeMakeup",
        "FaceMakeup",
        "LipMakeup",
      ];
      return makeupAssetTypes.includes(asset.assetType.name);
    },
    cssClass: "slots makeup-slots",
    showReorderControls: true,
    tooltipKey: "Message.MakeupLimitTooltip",
    emptySlotIcon: <Icon name="icon-regular-lips-lipstick-makeup-brush" size="XLarge" />,
  },
  eyebrow: {
    id: "eyebrow",
    maxSlots: 1,
    assetFilter: asset =>
      asset.assetType.name === "Eyebrow Accessory" || asset.assetType.name === "EyebrowAccessory",
    cssClass: "slots makeup-slots",
    tooltipKey: "Message.MakeupLimitTooltip",
    emptySlotIcon: <Icon name="icon-regular-eyebrows" size="XLarge" />,
  },
  eyelash: {
    id: "eyelash",
    maxSlots: 1,
    assetFilter: asset =>
      asset.assetType.name === "Eyelash Accessory" || asset.assetType.name === "EyelashAccessory",
    cssClass: "slots makeup-slots",
    tooltipKey: "Message.MakeupLimitTooltip",
    emptySlotIcon: <Icon name="icon-regular-eyelashes" size="XLarge" />,
  },
};

export function getSlotConfig(id: string | undefined): SlotConfiguration | undefined {
  if (!id) return undefined;
  return SLOT_CONFIGS[id];
}
