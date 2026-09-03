import React, { useState } from "react";
import classNames from "classnames";
import { TComponentType, THoverStyle, TWideTileComponentType } from "../types/bedev2Types";
import { debounce } from "../utils/helperUtils";
import WideGameTileLinkWrapper from "./WideGameTileLinkWrapper";

type TWideTileViewProps = {
  id: string;
  title: string;
  linkUrl: string;
  tileRef: React.Ref<HTMLDivElement>;

  hoverStyle?: THoverStyle;
  wideTileType: TWideTileComponentType;

  isHoverEnabled: boolean;
  isOnScreen: boolean;
  isContainedTile: boolean;
  isTileClickEnabled: boolean;

  // Additional handler to call on tile click, in addition to navigating to linkUrl
  onTileClick?: () => void;

  getShouldShowActionButton: (isFocused: boolean) => boolean;
  actionButton: JSX.Element;

  tileThumbnail: JSX.Element;
  thumbnailOverlayPill?: JSX.Element;

  tileFooter: JSX.Element;

  interestButton?: JSX.Element;
  systemFeedback?: JSX.Element;
};

const WideTileView = ({
  id,
  title,
  linkUrl,
  tileRef,
  hoverStyle,
  wideTileType,
  isHoverEnabled,
  isOnScreen,
  isContainedTile,
  isTileClickEnabled,
  onTileClick,
  getShouldShowActionButton,
  actionButton,
  tileThumbnail,
  thumbnailOverlayPill,
  tileFooter,
  interestButton,
  systemFeedback,
}: TWideTileViewProps): JSX.Element => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const [setFocusDebounced, cancelSetFocusDebounced] = debounce(() => {
    setIsFocused(true);
  }, 100);

  const [setFocusLostDebounced, cancelSetFocusLostDebounced] = debounce(() => {
    setIsFocused(false);
  }, 100);

  const onFocus = () => {
    cancelSetFocusLostDebounced();
    setFocusDebounced();
  };

  const onFocusLost = () => {
    cancelSetFocusDebounced();
    setFocusLostDebounced();
  };

  const tileClassName = classNames("list-item", "hover-game-tile", {
    "grid-tile": wideTileType === TComponentType.GridTile,
    "event-tile": wideTileType === TComponentType.EventTile,
    "interest-tile": wideTileType === TComponentType.InterestTile,
    "experience-events-tile": wideTileType === TComponentType.ExperienceEventsTile,
    "image-overlay": hoverStyle === THoverStyle.imageOverlay,
    "old-hover": hoverStyle !== THoverStyle.imageOverlay,
    "contained-tile": isContainedTile,
    focused: isFocused,
  });

  return (
    <li
      className={tileClassName}
      data-testid="wide-game-tile"
      onMouseOver={isHoverEnabled ? onFocus : undefined}
      onMouseLeave={isHoverEnabled ? onFocusLost : undefined}
      onFocus={isHoverEnabled ? onFocus : undefined}
      onBlur={isHoverEnabled ? onFocusLost : undefined}
      id={id}
    >
      <div className="featured-game-container game-card-container" ref={tileRef}>
        <WideGameTileLinkWrapper
          wrapperClassName="game-card-link"
          isTileClickEnabled={isTileClickEnabled}
          isOnScreen={isOnScreen}
          linkUrl={linkUrl}
          onTileClick={onTileClick}
        >
          <div className="featured-game-icon-container">
            {tileThumbnail}
            {thumbnailOverlayPill}
          </div>
          <div className="info-container">
            <div className="info-metadata-container">
              <div
                className="game-card-name game-name-title"
                data-testid="game-tile-game-title"
                title={title}
              >
                {title}
              </div>
              {tileFooter}
            </div>
            {hoverStyle === THoverStyle.imageOverlay && getShouldShowActionButton(isFocused) && (
              <div
                data-testid="game-tile-hover-game-tile-contents"
                className="play-button-container"
              >
                {actionButton}
              </div>
            )}
          </div>
        </WideGameTileLinkWrapper>
        {hoverStyle !== THoverStyle.imageOverlay && getShouldShowActionButton(isFocused) && (
          <div data-testid="game-tile-hover-game-tile-contents" className="game-card-contents">
            {actionButton}
          </div>
        )}
        {interestButton}
        {systemFeedback}
      </div>
    </li>
  );
};

WideTileView.defaultProps = {
  hoverStyle: undefined,
  thumbnailOverlayPill: undefined,
  interestButton: undefined,
  systemFeedback: undefined,
  onTileClick: undefined,
};

export default WideTileView;
