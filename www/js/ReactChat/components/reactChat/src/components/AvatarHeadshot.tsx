import classNames from "classnames";
import { Thumbnail2d } from "@rbx/www-common/components/thumbnail";

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
      containerClassName="block height-full width-full"
      format="webp"
      imgClassName={imageClassName}
      targetId={userId}
      type="AvatarHeadShot"
      includeProfileFrame
      // The AvatarExperience.Backgrounds.Thumbnails IXP is launched at 100%, so the headshot
      // background is the default. Legacy @rbx/thumbnails applied it via the experiment resolver;
      // set it explicitly here (www-common has no experiment hook) to keep parity.
      includeBackground
    />
  </span>
);

export default AvatarHeadshot;
