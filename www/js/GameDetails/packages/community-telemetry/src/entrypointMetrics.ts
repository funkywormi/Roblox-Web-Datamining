import { useRef } from "react";
import { uuidService } from "@rbx/core-scripts/legacy/core-utilities";

export const mintEntrypointImpressionId = (): string => uuidService.generateRandomUuid();

export const mintSearchId = (): string => uuidService.generateRandomUuid();

// Stable for the lifetime of the rendered component instance (one per tile).
// Use the returned id on both the exposure and the click for that tile.
export const useEntrypointImpressionId = (): string => {
  const idRef = useRef<string>();
  idRef.current ??= mintEntrypointImpressionId();
  return idRef.current;
};
