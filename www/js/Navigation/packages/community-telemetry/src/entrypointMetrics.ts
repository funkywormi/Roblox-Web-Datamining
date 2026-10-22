import { useRef } from "react";
import { generateRandomUuid } from "@rbx/core-lib/uuid";

export const mintEntrypointImpressionId = (): string => generateRandomUuid();

export const mintSearchId = (): string => generateRandomUuid();

// Stable for the lifetime of the rendered component instance (one per tile).
// Use the returned id on both the exposure and the click for that tile.
export const useEntrypointImpressionId = (): string => {
  const idRef = useRef<string | undefined>(undefined);
  idRef.current ??= mintEntrypointImpressionId();
  return idRef.current;
};
