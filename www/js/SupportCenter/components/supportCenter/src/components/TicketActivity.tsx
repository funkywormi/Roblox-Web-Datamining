import React, { useState } from "react";
import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import { Icon } from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailAssetsSize,
  ThumbnailAvatarsSize,
  ThumbnailGameIconSize,
  ThumbnailTypes,
} from "@rbx/thumbnails";
import ImageLightbox from "./ImageLightbox";
import TicketMetadata from "./TicketMetadata";
import { TicketMessageAuthorType } from "../types";

export interface TicketActivityProps {
  iconName: TTailwindIconClass;
  heading?: string;
  date?: Date;
  author?: { id: number; name: string; type: TicketMessageAuthorType };
  message?: string;
  assetIds?: number[];
  gameName?: string;
  metadata?: Record<string, string | number | boolean>;
  controls?: React.ReactNode;
}

const TicketActivity: React.FC<TicketActivityProps> = ({
  iconName,
  heading,
  date,
  author,
  message,
  assetIds,
  gameName,
  metadata,
  controls,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <div className="ticket-activity-item flex">
      <div className="flex flex-col items-center shrink-0">
        <div className="bg-shift-400 width-[2px] height-[16px]" />
        <Icon
          className="margin-top-[4px] margin-bottom-[4px]"
          name={iconName}
          size="Medium"
          shrink-0
        />
        <div className="chrono-trail-end bg-shift-400 width-[2px] grow-1" />
      </div>
      <div className="margin-left-small margin-top-[20px] margin-bottom-medium grow-1">
        {heading && <div className="text-title-medium">{heading}</div>}
        {date && (
          <div className="text-body-medium">
            {date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}
        <div className={heading || date ? "padding-top-small" : ""}>
          {author && (
            <div className="flex items-center padding-top-medium">
              <div className="width-[16px] height-[16px]">
                {author.type === TicketMessageAuthorType.Anonymous ? (
                  <Icon name="icon-regular-circle-person" size="Small" />
                ) : (
                  <Thumbnail2d
                    containerClass="width-full height-full radius-circle flex items-center justify-center"
                    imgClassName="width-full height-full radius-circle"
                    targetId={author.id}
                    type={
                      author.type === TicketMessageAuthorType.User
                        ? ThumbnailTypes.avatarHeadshot
                        : ThumbnailTypes.gameIcon
                    }
                    size={
                      author.type === TicketMessageAuthorType.User
                        ? ThumbnailAvatarsSize.size100
                        : ThumbnailGameIconSize.size50
                    }
                  />
                )}
              </div>
              <div className="text-label-medium padding-left-small">{author.name}</div>
            </div>
          )}
          {message && <div className="text-body-medium padding-top-small">{message}</div>}
          {assetIds && assetIds.length > 0 && (
            <div className="flex gap-small padding-top-small wrap">
              {assetIds.map((assetId, index) => (
                <button
                  key={assetId}
                  type="button"
                  className="width-[150px] height-[150px] padding-none stroke-none cursor-zoom-in radius-small clip"
                  onClick={() => {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <Thumbnail2d
                    containerClass="width-full height-full block flex justify-center"
                    imgClassName="object-fit-cover"
                    targetId={assetId}
                    type={ThumbnailTypes.assetThumbnail}
                    size={ThumbnailAssetsSize.size420}
                  />
                </button>
              ))}
            </div>
          )}
          {assetIds && assetIds.length > 0 && lightboxOpen && (
            <ImageLightbox
              assetIds={assetIds}
              initialIndex={lightboxIndex}
              title={gameName}
              onClose={() => {
                setLightboxOpen(false);
              }}
            />
          )}
          {metadata && <TicketMetadata metadata={metadata} />}
          {controls && (
            <div className={message || metadata ? "margin-top-small" : ""}>{controls}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketActivity;
