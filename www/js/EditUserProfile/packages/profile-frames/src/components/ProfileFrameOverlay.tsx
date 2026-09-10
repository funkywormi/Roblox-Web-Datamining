import type { CSSProperties, ReactNode } from "react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";

/**
 * The frame PNG's outer edge sits 1-2px inside its canvas, so a full-bleed avatar peeks
 * out past the ring. Shrinking the avatar (centered) hides that without moving the frame.
 */
const AVATAR_INSET_SCALE = 0.97;

type ProfileFrameOverlayProps = {
  /** The avatar (or any circular content) to draw the frame around. */
  children: ReactNode;
  /** The frame to overlay. `None`/undefined renders no ring. */
  frameAssetId?: number;
  className?: string;
  /** Extra styles on the root, e.g. a responsive width/height for the preview. */
  style?: CSSProperties;
};

/**
 * Draws the selected frame on top of a circular avatar preview by overlaying the
 * frame asset's thumbnail. Renders nothing extra for the "None" frame.
 *
 * Positioning uses inline styles on purpose: `absolute`/`inset-0` are not part of
 * this component's Foundation/Tailwind build, so relying on them silently no-ops.
 *
 * `overflow: hidden` clips the frame overlay to the (circular, via `radius-circle`)
 * root. Thumbnail2d's container carries a gray "placeholder" background; without the
 * clip its square corners escape the avatar circle and read as a gray box. Clipping
 * keeps that background but makes it a circle that matches the headshot.
 */
export const ProfileFrameOverlay = ({
  children,
  frameAssetId,
  className,
  style,
}: ProfileFrameOverlayProps) => (
  <div className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
    {frameAssetId ? (
      <div style={{ width: "100%", height: "100%", transform: `scale(${AVATAR_INSET_SCALE})` }}>
        {children}
      </div>
    ) : (
      children
    )}
    {frameAssetId && (
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Thumbnail2d
          containerClass="profile-frame-thumb"
          targetId={frameAssetId}
          type={ThumbnailTypes.assetThumbnail}
        />
      </div>
    )}
  </div>
);
