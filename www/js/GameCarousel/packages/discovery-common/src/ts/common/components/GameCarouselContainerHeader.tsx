import React from "react";
import GameCarouselContainerHeaderBase, {
  TGameCarouselContainerHeaderProps,
} from "./GameCarouselContainerHeaderBase";
import HomeSortHeader from "./HomeSortHeader";

const GameCarouselContainerHeader = (props: TGameCarouselContainerHeaderProps): JSX.Element => (
  <GameCarouselContainerHeaderBase {...props} NewSortHeader={HomeSortHeader} />
);

GameCarouselContainerHeader.defaultProps = GameCarouselContainerHeaderBase.defaultProps;

export default GameCarouselContainerHeader;
