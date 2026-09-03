import React from "react";
import type { AccoutrementAsset } from "@rbx/avatar-common";
import { EmptySlot } from "./Slot.types";

type AssetType = {
  id: number;
  name: string;
};

type Thumbnail = {
  Final: boolean;
  Url: string;
};

export type AssetSlot = {
  type: "Asset";
  id: number;
  name: string;
  assetType: AssetType;
  currentVersionId: number;
  thumbnail?: Thumbnail;
  thumbnailType?: string;
  link?: string;
  meta?: {
    order?: number;
  };
};

export type CategorySlot = AssetSlot | EmptySlot;

export function isEmptyCategorySlot(slot: CategorySlot): slot is EmptySlot {
  return "empty" in slot && slot.empty;
}

export type SlotConfiguration = {
  id: string;
  maxSlots: number;
  assetFilter: (asset: AccoutrementAsset) => boolean;
  showReorderControls?: boolean;
  cssClass: string;
  tooltipKey?: string;
  emptySlotIcon?: React.ReactNode;
};
