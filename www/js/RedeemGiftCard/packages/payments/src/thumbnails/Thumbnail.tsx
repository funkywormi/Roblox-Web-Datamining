import classNames from "classnames";
import { useThumbnail } from "./useThumbnail";
import type { ThumbnailType } from "./thumbnailsService";

export type ThumbnailProps = {
  type: ThumbnailType;
  targetId: number | string;
  size?: string;
  format?: string;
  altName?: string;
  imgClassName?: string;
  containerClass?: string;
};

/**
 * Drop-in replacement for `Thumbnail2d` that omits the angular dep
 * DO NOT REUSE THIS, THIS IS A PERFORMANCE WORKAROUND
 */
export function Thumbnail({
  type,
  targetId,
  size = "150x150",
  format = "webp",
  altName = "",
  imgClassName = "",
  containerClass = "",
}: ThumbnailProps): JSX.Element {
  const imageUrl = useThumbnail(type, targetId, size, format);

  return (
    <span className={classNames("thumbnail-2d-container", containerClass)}>
      {imageUrl && <img className={imgClassName} src={imageUrl} alt={altName} />}
    </span>
  );
}

export default Thumbnail;
