import React from "react";
import GameTileTypeMap from "../../common/components/GameTileTypeMap";
import GameCarouselHorizontalScrollBase, {
  TGamesPageGameCarouselProps,
} from "./GameCarouselHorizontalScrollBase";

export const GameCarouselHorizontalScroll = (props: TGamesPageGameCarouselProps): JSX.Element => (
  <GameCarouselHorizontalScrollBase {...props} TileComponent={GameTileTypeMap} />
);

GameCarouselHorizontalScroll.defaultProps = GameCarouselHorizontalScrollBase.defaultProps;

export default GameCarouselHorizontalScroll;
