import { UiComponentType } from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/ui_component_type_pb";
import type { SduiComponentConfig } from "../types";

const WIDE_TILE_COMPONENT_TYPES = new Set([UiComponentType.TILE, UiComponentType.GAME_TILE]);

function parseAspectRatio(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0;
}

/**
 * Returns true when the first item is a wide (16:9) tile.
 */
export function computeIsWideTiles(itemConfigs: SduiComponentConfig[]): boolean {
  const firstItem = itemConfigs[0];
  if (!firstItem) {
    return false;
  }

  if (!WIDE_TILE_COMPONENT_TYPES.has(firstItem.componentType)) {
    return false;
  }

  return parseAspectRatio(firstItem.props.imageAspectRatio ?? 0) > 1;
}
