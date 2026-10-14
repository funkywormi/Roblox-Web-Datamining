import { createContext } from "react";
import type { ComponentType } from "react";

export type TGameCardPlayButtonProps = {
  placeId: string;
  rootPlaceId?: string;
  universeId: string;
  privateServerLinkCode?: string;
};

// Supplied by the host so game-play-button stays out of bundles that can't run it yet (Next.js).
const GameCardPlayButtonContext = createContext<ComponentType<TGameCardPlayButtonProps> | null>(
  null,
);

export default GameCardPlayButtonContext;
