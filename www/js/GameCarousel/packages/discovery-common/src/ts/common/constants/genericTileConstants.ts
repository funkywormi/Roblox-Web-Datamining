import { TGameTileBadgeComponentType } from "../types/bedev1Types";

export enum TileBadgePositionEnum {
  INVALID = "Invalid",
  IMAGE_TOP_LEFT = "ImageTopLeft",
  IMAGE_TOP_RIGHT = "ImageTopRight",
  IMAGE_BOTTOM_LEFT = "ImageBottomLeft",
  IMAGE_BOTTOM_RIGHT = "ImageBottomRight",
}

export const componentTypeClassMap: Record<TGameTileBadgeComponentType, string> = {
  [TGameTileBadgeComponentType.Pill]: "",
  [TGameTileBadgeComponentType.RoundedRectangle]: "game-card-badge-rounded-rectangle",
};

export default { TileBadgePositionEnum, componentTypeClassMap };
