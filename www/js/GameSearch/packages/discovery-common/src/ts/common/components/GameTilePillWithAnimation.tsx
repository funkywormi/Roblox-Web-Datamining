import React from "react";
import classNames from "classnames";
import { Icon } from "@rbx/foundation-ui";
import { TGameTileBadgeComponentType, TGameTilePillData } from "../types/bedev1Types";
import { componentTypeClassMap } from "../constants/genericTileConstants";

export interface GameTilePillWithAnimationProps extends TGameTilePillData {
  isFocused?: boolean;
}

const GameTilePillWithAnimation = ({
  animationClass,
  isFocused,
  icons,
  text,
  componentType,
}: GameTilePillWithAnimationProps): JSX.Element | null => {
  if (icons?.length || text) {
    return (
      <div
        className={classNames(
          "game-card-pill-with-animation",
          componentTypeClassMap[componentType ?? TGameTileBadgeComponentType.Pill],
        )}
      >
        <div
          className={classNames("game-card-pill-animation-container", {
            [animationClass ?? ""]: animationClass && isFocused,
          })}
        >
          {icons?.length &&
            icons.map((icon, index) =>
              icon.type === "foundation" ? (
                // eslint-disable-next-line react/no-array-index-key
                <Icon key={index} name={icon.class} size="Small" className="game-card-pill-icon" />
              ) : (
                // eslint-disable-next-line react/no-array-index-key
                <span key={index} className={`game-card-pill-icon ${icon.class}`} />
              ),
            )}
          {text && <div className="game-card-pill-text">{text}</div>}
        </div>
      </div>
    );
  }

  return null;
};

GameTilePillWithAnimation.defaultProps = {
  animation: undefined,
};

export default GameTilePillWithAnimation;
