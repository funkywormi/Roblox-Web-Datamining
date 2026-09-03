import React, { Ref } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { PageContext } from "../types/pageContext";
import { GameTileHiddenReason } from "./GameTileUtils";
import NotInterestedHiddenTileContent from "./NotInterestedHiddenTileContent";

export type TWideGameTileHiddenProps = {
  reason?: GameTileHiddenReason;
  setIsHidden?: (isHidden: boolean) => void;
  toggleIsHidden?: () => void;
  universeId: number;
  topicId?: string;
  isSponsored?: boolean;
  page?: PageContext;
  translate: TranslateFunction;
};

const WideGameTileHidden = React.forwardRef(
  (
    {
      reason,
      setIsHidden,
      toggleIsHidden,
      universeId,
      topicId,
      isSponsored,
      page,
      translate,
    }: TWideGameTileHiddenProps,
    ref: Ref<HTMLDivElement>,
  ): JSX.Element | null => {
    switch (reason) {
      case GameTileHiddenReason.NotInterested:
        return (
          <li className="hover-game-tile grid-tile hidden-tile">
            <div className="featured-game-container">
              <div className="featured-game-icon-container placeholder-thumbnail" ref={ref}>
                <NotInterestedHiddenTileContent
                  translate={translate}
                  universeId={universeId}
                  topicId={topicId}
                  page={page}
                  isSponsored={isSponsored}
                  setIsHidden={setIsHidden}
                  toggleIsHidden={toggleIsHidden}
                />
              </div>
            </div>
          </li>
        );
      default:
        console.error(`WideGameTileHidden: unsupported reason "${String(reason)}"`);
        return null;
    }
  },
);

WideGameTileHidden.displayName = "WideGameTileHidden";
export default WideGameTileHidden;
