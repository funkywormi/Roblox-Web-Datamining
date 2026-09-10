import { useTranslation } from "@rbx/core-scripts/react";
import { Badge, Icon, ListItem } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailTypes } from "@rbx/thumbnails";

import type { ProfileFrame } from "../types";

type ProfileFrameListItemProps = {
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
          altName={equippedFrame.name}
          containerClass="profile-frame-thumb profile-frame-item-thumb radius-circle"
          targetId={equippedFrame.assetId}
          type={ThumbnailTypes.assetThumbnail}
        />
      </div>
    );
  }

  if (equippedFrame?.assetId === 0) {
    return <Icon className="content-default" name="icon-regular-circle-slash" size="Medium" />;
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
export const ProfileFrameListItem = ({
  equippedFrame,
  showNewBadge = false,
  onClick,
  divider = "Full",
}: ProfileFrameListItemProps) => {
  const { translate } = useTranslation();
  const label = translate("Heading.ProfileFrame");

  return (
    <ListItem
      divider={divider}
      isContained
      // The badge has to sit inline with the label, which ListItem's native title slot
      // can't express — so when it's showing, the label moves into `leading` and
      // re-states the title typography.
      leading={
        showNewBadge ? (
          <div className="gap-small flex items-center">
            <span className="content-emphasis text-align-x-start text-title-large">{label}</span>
            <Badge label={translate("Label.New")} shape="Box" size="XSmall" variant="Contrast" />
          </div>
        ) : undefined
      }
      title={showNewBadge ? undefined : label}
      trailing={
        <div className="gap-small min-width-0 flex items-center">
          {!showNewBadge && <Preview equippedFrame={equippedFrame} />}
          <Icon
            className="shrink-0"
            data-testid="profile-frame-list-item-chevron"
            name="icon-regular-chevron-large-right"
            size="Small"
          />
        </div>
      }
      onSelect={onClick}
    />
  );
};
