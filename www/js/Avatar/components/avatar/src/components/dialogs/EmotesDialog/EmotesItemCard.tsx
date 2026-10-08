import type React from "react";
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from "classnames";
import { Thumbnail2d } from "@rbx/www-common/components/thumbnail";
import { ThumbnailTypes } from "../../../constants/thumbnailConstants";
import { CatalogItem } from "../../../avatar.types";

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
  return (
    <div
      className={classNames("item-card-container", {
        "is-selected": isSelected,
      })}
      onClick={() => {
        onEmotesCardClick(item.id);
      }}
      data-item-id={item.id}
      data-item-name={item.name}
      style={{ cursor: "pointer" }}
    >
      <div className="item-card-link">
        <div className="item-card-thumb-container">
          <Thumbnail2d
            containerClassName="item-card-thumb emotes-center-div"
            targetId={item.id}
            type={ThumbnailTypes.assetThumbnail}
          />
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
