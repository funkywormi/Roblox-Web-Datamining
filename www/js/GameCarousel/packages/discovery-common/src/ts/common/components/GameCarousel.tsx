import React, { forwardRef, MutableRefObject } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import classNames from "classnames";
import { TBuildEventProperties } from "./GameTileUtils";
import { isWideTileComponentType } from "../utils/parsingUtils";
import { TGameData, TGetFriendsResponse } from "../types/bedev1Types";
import {
  TComponentType,
  TPlayButtonStyle,
  TPlayerCountStyle,
  THoverStyle,
} from "../types/bedev2Types";
import GameTileTypeMap from "./GameTileTypeMap";
import "../../../css/common/_gameCarousel.scss";

export type TGameCarouselProps = {
  gameData: TGameData[];
  friendData?: TGetFriendsResponse[];
  translate: WithTranslationsProps["translate"];
  buildEventProperties: TBuildEventProperties;
  tileRef?: MutableRefObject<HTMLDivElement | null>;
  componentType?: TComponentType;
  playerCountStyle?: TPlayerCountStyle;
  playButtonStyle?: TPlayButtonStyle;
  navigationRootPlaceId?: string;
  isSponsoredFooterAllowed?: boolean;
  hideTileMetadata?: boolean;
  hoverStyle?: THoverStyle;
  topicId?: string;
  isDynamicLayoutSizingEnabled?: boolean;
};

export const GameCarousel = forwardRef<HTMLDivElement, TGameCarouselProps>(
  (
    {
      gameData,
      buildEventProperties,
      translate,
      friendData,
      componentType,
      playerCountStyle,
      playButtonStyle,
      navigationRootPlaceId,
      isSponsoredFooterAllowed,
      hideTileMetadata,
      hoverStyle,
      topicId,
      isDynamicLayoutSizingEnabled,
      tileRef,
    }: TGameCarouselProps,
    forwardedRef,
  ) => {
    const carouselClassName = classNames(
      "game-carousel",
      {
        "wide-game-tile-carousel": isWideTileComponentType(componentType),
      },
      {
        "dynamic-layout-sizing": isDynamicLayoutSizingEnabled,
      },
      {
        "dynamic-layout-sizing-disabled": !isDynamicLayoutSizingEnabled,
      },
    );

    return (
      <div data-testid="game-carousel" ref={forwardedRef} className={carouselClassName}>
        {gameData.map((data, positionId) => (
          <GameTileTypeMap
            componentType={componentType}
            playerCountStyle={playerCountStyle}
            playButtonStyle={playButtonStyle}
            navigationRootPlaceId={navigationRootPlaceId}
            isSponsoredFooterAllowed={isSponsoredFooterAllowed}
            hideTileMetadata={hideTileMetadata}
            hoverStyle={hoverStyle}
            topicId={topicId}
            ref={tileRef}
            // eslint-disable-next-line react/no-array-index-key
            key={positionId}
            id={positionId}
            gameData={data}
            translate={translate}
            buildEventProperties={buildEventProperties}
            friendData={friendData}
          />
        ))}
      </div>
    );
  },
);
GameCarousel.displayName = "GameCarousel";
export default GameCarousel;
