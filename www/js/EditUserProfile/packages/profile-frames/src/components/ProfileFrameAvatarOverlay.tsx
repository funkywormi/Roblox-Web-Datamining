import type { CSSProperties, ReactNode } from "react";
import { ProfileFrameOverlay } from "./ProfileFrameOverlay";
import { useProfileFrames } from "../hooks/useProfileFrames";

type ProfileFrameAvatarOverlayProps = {
  /** The avatar to draw the equipped frame around. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Draws the user's equipped frame around their avatar.
 *
 * Resolves the equipped frame itself rather than taking it as a prop, since the avatar and
 * the frame row usually sit far apart in the tree. Shares `useProfileFrames`' cached
 * queries with the host's frame row, so mounting both costs one pair of requests.
 */
export const ProfileFrameAvatarOverlay = ({
  children,
  className,
  style,
}: ProfileFrameAvatarOverlayProps) => {
  const { equippedFrameId } = useProfileFrames();

  return (
    <ProfileFrameOverlay className={className} frameAssetId={equippedFrameId} style={style}>
      {children}
    </ProfileFrameOverlay>
  );
};
