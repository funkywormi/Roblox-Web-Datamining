import React, { forwardRef } from "react";
import { TComponentType } from "../types/bedev2Types";
import GameTile, { TGameTileProps } from "./GameTile";
import WideGameTileWrapper, { TWideGameTileWrapperProps } from "./WideGameTileWrapper";

type TTileProps = TGameTileProps | TWideGameTileWrapperProps;

export type TGameTileTypeMapProps = TTileProps & {
  componentType?: TComponentType;
};

export const GameTileTypeMap = forwardRef<HTMLDivElement, TGameTileTypeMapProps>(
  ({ componentType, ...tileProps }: TGameTileTypeMapProps, forwardedRef) => {
    switch (componentType) {
      case TComponentType.AppGameTileNoMetadata:
        return <GameTile ref={forwardedRef} hideTileMetadata {...tileProps} />;
      case TComponentType.GridTile:
      case TComponentType.EventTile:
      case TComponentType.InterestTile:
        return (
          <WideGameTileWrapper ref={forwardedRef} wideTileType={componentType} {...tileProps} />
        );
      default:
        return <GameTile ref={forwardedRef} {...tileProps} />;
    }
  },
);

GameTileTypeMap.displayName = "GameTileTypeMap";
export default GameTileTypeMap;
