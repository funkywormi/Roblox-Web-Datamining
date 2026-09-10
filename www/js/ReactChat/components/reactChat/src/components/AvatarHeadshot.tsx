import classNames from "classnames";
import { Thumbnail2d, ThumbnailFormat, ThumbnailTypes } from "@rbx/thumbnails";

type TAvatarHeadshotProps = {
  userId: number;
  displayName: string;
  containerClassName: string;
  imageClassName?: string;
};

/**
 * Wraps `Thumbnail2d` in a fixed-size box so the loading shimmer does not collapse
 * layout (the thumbnail container uses `float: left` and renders no `<img>` until loaded).
 */
const AvatarHeadshot = ({
  userId,
  displayName,
  containerClassName,
  imageClassName = "height-full width-full object-cover",
}: TAvatarHeadshotProps) => (
  <span
    className={classNames("react-chat-avatar-headshot inline-flex shrink-0", containerClassName)}
  >
    <Thumbnail2d
      altName={displayName}
      containerClass="block height-full width-full"
      format={ThumbnailFormat.webp}
      imgClassName={imageClassName}
      targetId={userId}
      type={ThumbnailTypes.avatarHeadshot}
      includeProfileFrame
      // Seed from the resolved-URL cache so avatars don't re-shimmer when chat screens remount them.
      seedFromCache
    />
  </span>
);

export default AvatarHeadshot;
