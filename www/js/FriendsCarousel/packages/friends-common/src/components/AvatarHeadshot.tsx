import { JSX } from "react";
import { AvatarCardItem } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import {
  Thumbnail2d,
  ThumbnailTypes,
  DefaultThumbnailSize,
  useProfileFrameExperiment,
} from "@rbx/thumbnails";
import Presence from "@rbx/presence";

const AvatarHeadshot = ({
  id,
  userProfileUrl,
  handleImageClick,
  translate,
}: {
  id: number;
  userProfileUrl: string;
  handleImageClick?: () => void;
  translate: TranslateFunction;
}): JSX.Element => {
  // Carousel is the only frame surface behind the IXP gate; others render ungated.
  const isProfileFrameEnabled = useProfileFrameExperiment();
  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={DefaultThumbnailSize}
      targetId={id}
      containerClass="avatar-card-image"
      includeProfileFrame={isProfileFrameEnabled}
    />
  );
  return (
    <AvatarCardItem.Headshot
      statusIcon={<Presence.PresenceStatusIcon translate={translate} userId={id} />}
      thumbnail={thumbnail}
      imageLink={userProfileUrl}
      handleImageClick={handleImageClick}
    />
  );
};

export default AvatarHeadshot;
