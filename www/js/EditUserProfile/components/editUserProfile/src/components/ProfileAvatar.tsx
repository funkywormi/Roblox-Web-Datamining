import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";

interface ProfileAvatarProps {
  userId: number;
  displayName?: string;
}

export const ProfileAvatar = ({ userId, displayName }: ProfileAvatarProps) => (
  // `scale(0.97)` tucks the headshot just inside the frame ring: the frame PNG's outer edge
  // sits ~1-2px inside its canvas, so a full-bleed headshot bleeds past it (bottom edge).
  // Matches the dialog preview; invisible when no frame since the bg matches the page.
  <div
    className="width-2400 height-2400 radius-circle overflow-hidden bg-surface-sunken-0"
    style={{ transform: "scale(0.97)" }}
  >
    <Thumbnail2d
      targetId={userId}
      type={ThumbnailTypes.avatarHeadshot}
      size={ThumbnailAvatarHeadshotSize.size150}
      altName={displayName ?? "Profile avatar"}
      containerClass="width-full height-full radius-circle"
    />
  </div>
);
