import { Thumbnail2d, ThumbnailTypes, ThumbnailAvatarHeadshotSize } from "@rbx/thumbnails";

interface ProfileAvatarProps {
  userId: number;
  displayName?: string;
}

const ProfileAvatar = ({ userId, displayName }: ProfileAvatarProps) => (
  <div className="width-2400 height-2400 radius-circle overflow-hidden bg-surface-sunken-0">
    <Thumbnail2d
      targetId={userId}
      type={ThumbnailTypes.avatarHeadshot}
      size={ThumbnailAvatarHeadshotSize.size150}
      altName={displayName ?? "Profile avatar"}
      containerClass="width-full height-full radius-circle"
    />
  </div>
);

export default ProfileAvatar;
