import React, { forwardRef } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import GameTileContent, { TGameTileProps } from "./GameTileContent";
import GameTileOverflowMenu from "./GameTileOverflowMenu";

export type { TGameTileProps } from "./GameTileContent";

export const GameTile = forwardRef<HTMLDivElement, TGameTileProps>((props, ref) => (
  <QueryClientProvider client={queryClient}>
    <GameTileContent {...props} OverflowMenu={GameTileOverflowMenu} ref={ref} />
  </QueryClientProvider>
));
GameTile.displayName = "GameTile";
export default GameTile;
