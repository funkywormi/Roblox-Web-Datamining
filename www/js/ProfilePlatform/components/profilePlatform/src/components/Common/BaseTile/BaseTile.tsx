import { ReactNode } from "react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import "./baseTile.scss";

type BaseTileProps = {
  type: ThumbnailTypes;
  targetId: number | string;
  href: string;
  title: string | ReactNode;
  metadata?: ReactNode | string;
  titleTag?: string;
  thumbnailOverlay?: ReactNode;
};

const BaseTile = (props: BaseTileProps) => {
  const { type, targetId, href, title, metadata, titleTag, thumbnailOverlay } = props;

  return (
    <div className="base-tile">
      <a className="flex flex-col" href={href} title={typeof title === "string" ? title : titleTag}>
        <div className="base-tile-thumbnail-wrapper">
          <Thumbnail2d
            type={type}
            targetId={targetId}
            containerClass="base-tile-thumbnail radius-medium"
          />
          {thumbnailOverlay}
        </div>
        <div className="base-tile-title content-emphasis text-title-medium padding-top-medium">
          {title}
        </div>
        <div className="base-tile-metadata content-default text-body-medium padding-top-xsmall">
          {metadata}
        </div>
      </a>
    </div>
  );
};

export default BaseTile;
