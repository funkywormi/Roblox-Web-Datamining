import { useMemo } from "react";
import { computed } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";
import { getHiddenGameTile, type HiddenGameTile } from "./gameTileFeedbackStore";

/**
 * The tile's hidden state, subscribing only to this tile's entry so hiding or
 * updating one tile does not rerender other tiles across the page.
 */
export function useHiddenGameTile(
  collectionId?: string,
  universeId?: string,
): HiddenGameTile | undefined {
  useSignals();
  const hiddenTile = useMemo(
    () =>
      collectionId && universeId
        ? computed(() => getHiddenGameTile(collectionId, universeId))
        : undefined,
    [collectionId, universeId],
  );
  return hiddenTile?.value;
}
