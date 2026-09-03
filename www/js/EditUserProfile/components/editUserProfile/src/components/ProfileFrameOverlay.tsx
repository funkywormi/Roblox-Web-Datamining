import { CSSProperties, ReactNode } from "react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";

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
    {children}
    {frameAssetId && (
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <Thumbnail2d
          targetId={frameAssetId}
          type={ThumbnailTypes.assetThumbnail}
          containerClass="profile-frame-thumb"
        />
      </div>
    )}
  </div>
);
