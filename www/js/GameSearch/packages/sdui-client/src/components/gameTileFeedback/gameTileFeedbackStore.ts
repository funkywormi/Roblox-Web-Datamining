import { signal } from "@preact/signals-react";

export type HiddenGameTile = {
  /** From the "Not interested" action that hid the tile; the feedback signal reuses it. */
  isSponsored: boolean;
  /** Set once the feedback form is submitted, which hides the Give feedback button. */
  isFeedbackSent: boolean;
};

type HiddenTilesByCollection = ReadonlyMap<string, ReadonlyMap<string, HiddenGameTile>>;

const hiddenTiles = signal<HiddenTilesByCollection>(new Map());

export function getHiddenGameTile(
  collectionId: string,
  universeId: string,
): HiddenGameTile | undefined {
  return hiddenTiles.value.get(collectionId)?.get(universeId);
}

function updateCollection(
  collectionId: string,
  update: (tiles: Map<string, HiddenGameTile>) => void,
): void {
  const tiles = new Map(hiddenTiles.value.get(collectionId));
  update(tiles);
  hiddenTiles.value = new Map(hiddenTiles.value).set(collectionId, tiles);
}

/**
 * Hides or restores one game tile. Keyed by collection so the same universe in
 * another sort stays visible, matching the app. Restoring drops the feedback state.
 */
export function setGameTileHidden(
  collectionId: string,
  universeId: string,
  isHidden: boolean,
  isSponsored = false,
): void {
  if ((getHiddenGameTile(collectionId, universeId) != null) === isHidden) {
    return;
  }
  updateCollection(collectionId, tiles => {
    if (isHidden) {
      tiles.set(universeId, { isSponsored, isFeedbackSent: false });
    } else {
      tiles.delete(universeId);
    }
  });
}

/** Records whether feedback was sent for a hidden tile. Does nothing for a visible tile. */
export function setGameTileFeedbackSent(
  collectionId: string,
  universeId: string,
  isFeedbackSent: boolean,
): void {
  const tile = getHiddenGameTile(collectionId, universeId);
  if (tile == null || tile.isFeedbackSent === isFeedbackSent) {
    return;
  }
  updateCollection(collectionId, tiles => {
    tiles.set(universeId, { ...tile, isFeedbackSent });
  });
}
