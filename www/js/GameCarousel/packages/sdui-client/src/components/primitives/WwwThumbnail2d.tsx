import { useState } from "react";
import { clsx } from "clsx";
import { isThumbnailType, Thumbnail2d } from "@rbx/www-common/components/thumbnail";
import { getCurrentUser } from "@rbx/www-common/user";
import type { RbxThumbParams } from "@rbx/sdui-core";

type WwwThumbnail2dProps = {
  thumbnail: RbxThumbParams;
  containerClassName?: string;
  imgClassName?: string;
  altName?: string;
};

function WwwThumbnail2dInner({
  thumbnail,
  containerClassName,
  imgClassName,
  altName,
}: WwwThumbnail2dProps): React.JSX.Element {
  const { type, targetId, size, includeBackground, includeProfileFrame } = thumbnail;
  // www-common Thumbnail2d does not mark an image that is still downloading, so mark it here for the
  // game tile shimmer in sduiGameTile.css.
  const [isLoaded, setIsLoaded] = useState(false);
  if (!isThumbnailType(type)) {
    return <span className={clsx("thumbnail-2d-container icon-broken", containerClassName)} />;
  }
  return (
    <Thumbnail2d
      type={type}
      targetId={targetId}
      size={size}
      format="webp"
      // Headshot background is rolled out to 100% of signed-in users (IXP rollout 1715 on
      // Avatar.AvatarExperience2, keyed on user id), so default it on for them instead of reading IXP
      // like @rbx/thumbnails does. Signed-out users get no value from IXP, so they stay without it.
      includeBackground={
        includeBackground ?? (type === "AvatarHeadShot" && getCurrentUser() !== undefined)
      }
      includeProfileFrame={includeProfileFrame}
      containerClassName={containerClassName}
      imgClassName={clsx(imgClassName, !isLoaded && "sdui-thumbnail-loading")}
      altName={altName}
      onLoad={() => {
        setIsLoaded(true);
      }}
    />
  );
}

/**
 * www-common Thumbnail2d for an `rbxthumb://` image. The type comes from the server, so one
 * Thumbnail2d does not support gets the same broken-image state as a thumbnail that fails to load.
 */
export function WwwThumbnail2d(props: WwwThumbnail2dProps): React.JSX.Element {
  const { type, targetId, size } = props.thumbnail;
  // Remount when the image changes so the loaded state resets without an Effect.
  return <WwwThumbnail2dInner {...props} key={`${type}:${targetId}:${size}`} />;
}
