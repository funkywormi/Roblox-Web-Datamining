import { Badge, Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";
import { ProfileSettingRow } from "./ProfileSettingRow";
import { ProfileFrame } from "../types/ProfileFrameTypes";

type ProfileFrameRowProps = {
  /** The currently equipped frame (used to render the row's trailing preview). */
  equippedFrame?: ProfileFrame;
  /** When true, show a "New" badge next to the label (until the user opens the dialog). */
  showNewBadge?: boolean;
  onClick: () => void;
  divider?: "Full" | "None";
};

const Preview = ({ equippedFrame }: { equippedFrame?: ProfileFrame }) => {
  if (equippedFrame?.assetId && equippedFrame.assetId > 0) {
    return (
      <div className="radius-circle overflow-hidden" style={{ width: 28, height: 28 }}>
        <Thumbnail2d
          targetId={equippedFrame.assetId}
          type={ThumbnailTypes.assetThumbnail}
          altName={equippedFrame.name}
          containerClass="profile-frame-thumb profile-frame-item-thumb radius-circle"
        />
      </div>
    );
  }

  if (equippedFrame?.assetId === 0) {
    return <Icon name="icon-regular-circle-slash" size="Medium" className="content-default" />;
  }

  return null;
};

/**
 * "Profile frame" row in the edit-profile list. Opens the chooser dialog on click.
 *
 * Per design, the "New" badge and the trailing preview are mutually exclusive: while
 * the feature is new (`showNewBadge`, backed by localStorage), the row shows the "New"
 * badge next to the label and hides the trailing preview. Once the user has tapped the
 * row (badge dismissed / seen persisted), the badge goes away and the trailing slot
 * shows the frame preview — a small circular thumbnail of the equipped frame, or a
 * "no frame" icon when none is set.
 */
export const ProfileFrameRow = ({
  equippedFrame,
  showNewBadge = false,
  onClick,
  divider,
}: ProfileFrameRowProps) => {
  const { translate } = useTranslation();
  return (
    <ProfileSettingRow
      label={translate("Heading.ProfileFrame")}
      // Hide the preview while the "New" badge is showing; reveal it once dismissed.
      trailingValue={showNewBadge ? undefined : <Preview equippedFrame={equippedFrame} />}
      titleBadge={
        showNewBadge ? (
          <Badge label={translate("Label.New")} variant="Contrast" size="XSmall" shape="Box" />
        ) : undefined
      }
      onClick={onClick}
      divider={divider}
    />
  );
};
