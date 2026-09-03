import React, { forwardRef } from "react";
import WideGameTile, { TWideGameTileProps } from "./WideGameTile";
import HiddenGameTile from "./HiddenGameTile";

export type TWideGameTileWrapperProps = TWideGameTileProps & {
  isHidden?: boolean;
};

export const WideGameTileWrapper = forwardRef<HTMLDivElement, TWideGameTileWrapperProps>(
  ({ isHidden, ...tileProps }: TWideGameTileWrapperProps, forwardedRef) => {
    if (isHidden) {
      return (
        <HiddenGameTile
          ref={forwardedRef}
          setIsHidden={tileProps.setIsHidden}
          toggleIsHidden={tileProps.toggleIsHidden}
          universeId={tileProps.gameData.universeId}
          topicId={tileProps.topicId}
          isSponsored={tileProps.gameData.isSponsored}
          page={tileProps.page}
          translate={tileProps.translate}
        />
      );
    }

    return <WideGameTile ref={forwardedRef} {...tileProps} />;
  },
);

WideGameTileWrapper.displayName = "WideGameTileWrapper";
export default WideGameTileWrapper;
