import type React from "react";
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/www-common/components/thumbnail";
import { ThumbnailTypes } from "../../../constants/thumbnailConstants";
import { CatalogItem } from "../../../avatar.types";
import useAnimationItemCardHoverPreviewIxp from "../../../hooks/useAnimationItemCardHoverPreviewIxp";
import useAnimationPreviewHover from "../../../hooks/useAnimationPreviewHover";
import AnimatedAssetThumbnail from "../../AnimatedAssetThumbnail";

export type EmotesItemCardProps = {
  isSelected: boolean;
  item: CatalogItem;
  onEmotesCardClick: (itemId: number) => void;
};

const EmotesItemCard = ({
  isSelected,
  item,
  onEmotesCardClick,
}: EmotesItemCardProps): React.ReactElement => {
  const previewKey = `emote-item-${item.id}`;
  const isHoverPreviewIxpEnabled = useAnimationItemCardHoverPreviewIxp();
  const { isPlaying, onHoverStart, onHoverEnd } = useAnimationPreviewHover(
    previewKey,
    isHoverPreviewIxpEnabled,
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEmotesCardClick(item.id);
    }
  };

  const onFocusOut = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      onHoverEnd();
    }
  };

  return (
    <div
      className={classNames("item-card-container", {
        "is-selected": isSelected,
      })}
      role="button"
      tabIndex={0}
      aria-label={item.name}
      onClick={() => {
        onEmotesCardClick(item.id);
      }}
      onKeyDown={handleKeyDown}
      data-item-id={item.id}
      data-item-name={item.name}
      style={{ cursor: "pointer" }}
      onMouseEnter={isHoverPreviewIxpEnabled ? onHoverStart : undefined}
      onMouseLeave={isHoverPreviewIxpEnabled ? onHoverEnd : undefined}
      onFocus={isHoverPreviewIxpEnabled ? onHoverStart : undefined}
      onBlur={isHoverPreviewIxpEnabled ? onFocusOut : undefined}
    >
      <div className="item-card-link">
        <div className="item-card-thumb-container">
          {isHoverPreviewIxpEnabled ? (
            <AnimatedAssetThumbnail
              targetId={item.id}
              isPlaying={isPlaying}
              previewKey={previewKey}
            >
              <Thumbnail2d
                containerClassName="item-card-thumb emotes-center-div"
                targetId={item.id}
                type={ThumbnailTypes.assetThumbnail}
              />
            </AnimatedAssetThumbnail>
          ) : (
            <Thumbnail2d
              containerClassName="item-card-thumb emotes-center-div"
              targetId={item.id}
              type={ThumbnailTypes.assetThumbnail}
            />
          )}
        </div>
      </div>
      <div className="item-card-caption">
        <div className="item-card-name-link">
          <div title={item.name} className="item-card-name">
            {item.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotesItemCard;
