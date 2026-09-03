/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import classNames from "classnames";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
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
}: EmotesItemCardProps): JSX.Element => {
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
            containerClass="item-card-thumb emotes-center-div"
            targetId={item.id?.toString()}
            type={ThumbnailTypes.assetThumbnail}
          />
        </div>
      </div>
      <div className="item-card-caption">
        <div className="item-card-name-link">
          <div title={item.name} className="text-overflow item-card-name">
            {item.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotesItemCard;
