import { CSSProperties } from "react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { ProfileFrame } from "../types/ProfileFrameTypes";

type ProfileFrameItemProps = {
  frame: ProfileFrame;
  isSelected: boolean;
  onSelect: (frameId: number) => void;
};

// Reset native <button> chrome inline; `bg-transparent`/`border-none` aren't in this
// component's Foundation/Tailwind build, so the button would otherwise render gray.
const BUTTON_RESET: CSSProperties = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  width: "100%",
  // Let the grid item shrink below its content's intrinsic width so an oversized
  // frame thumbnail can't widen its column.
  minWidth: 0,
  padding: 0,
};

// Square tile that fills its grid column (matches the Figma tile proportions).
// `padding` insets the ring so it isn't edge-to-edge — the tile surface shows as
// breathing room around the frame, like the Figma. `border-box` keeps the tile square.
const TILE_BASE: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  boxSizing: "border-box",
  padding: "8.5%",
};

/**
 * A single selectable tile in the frame grid: a large square tile showing the
 * frame's thumbnail (or a "no frame" icon for None) and the frame name below.
 */
export const ProfileFrameItem = ({ frame, isSelected, onSelect }: ProfileFrameItemProps) => {
  const tileStyle: CSSProperties = {
    ...TILE_BASE,
    // Selected highlight: an outset ring that follows the tile's rounded corners.
    // The grid's column gap leaves room so it never touches a neighbor. Uses
    // `currentColor` (set via the `content-emphasis` token below) so the ring is
    // visible on both dark and light themes instead of a hardcoded white.
    boxShadow: isSelected ? "0 0 0 2px currentColor" : undefined,
  };

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(frame.assetId);
      }}
      aria-pressed={isSelected}
      aria-label={frame.name}
      className="flex flex-col gap-small"
      style={BUTTON_RESET}
    >
      {/* Uniform tile surface with the ring inset (see TILE_BASE padding). The frame's
          Thumbnail2d carries its own themed placeholder background; `profile-frame-item-thumb`
          clears it so only this tile's surface shows around the ring. */}
      <div
        className={`flex items-center justify-center radius-medium ${
          isSelected ? "bg-surface-300 content-emphasis" : "bg-surface-200"
        }`}
        style={tileStyle}
      >
        <Thumbnail2d
          targetId={frame.assetId}
          type={ThumbnailTypes.assetThumbnail}
          altName={frame.name}
          containerClass="profile-frame-thumb profile-frame-item-thumb radius-medium"
        />
      </div>
      <span
        className="text-body-large content-emphasis"
        style={{
          textAlign: "left",
          width: "100%",
          minWidth: 0,
          fontWeight: 700,
          // Break long, space-less frame names (e.g. "FrameBulePurpleTest1") so the
          // label stays within its tile instead of spilling into the next column.
          overflowWrap: "anywhere",
        }}
      >
        {frame.name}
      </span>
    </button>
  );
};
