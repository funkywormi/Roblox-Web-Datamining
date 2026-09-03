import { JSX } from "react";
import {
  Thumbnail2d,
  ThumbnailFormat,
  ThumbnailGameIconSize,
  ThumbnailTypes,
} from "roblox-thumbnails";
import { SettingControlItem } from "@rbx/user-settings";
import { Toggle } from "@rbx/core-ui/legacy/react-style-guide";

export type ThumbnailNotificationSettingData = {
  targetId: number;
  name: string;
  description?: string;
};

type ThumbnailNotificationsToggleProps = {
  setting: ThumbnailNotificationSettingData;
  isOn: boolean;
  onToggle: (next: boolean) => void;
  isDisabled?: boolean;
  /** If set, the thumbnail is wrapped in an anchor linking to this URL. */
  thumbnailHref?: string;
};

export const ThumbnailNotificationsToggle = ({
  setting,
  isOn,
  onToggle,
  isDisabled = false,
  thumbnailHref,
}: ThumbnailNotificationsToggleProps): JSX.Element => {
  const toggleId = `toggle-experience-${setting.targetId}`;

  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.gameIcon}
      size={ThumbnailGameIconSize.size50}
      targetId={setting.targetId}
      containerClass="experience-notification-thumbnail"
      format={ThumbnailFormat.jpeg}
      altName={setting.name}
    />
  );

  return (
    <SettingControlItem
      id={toggleId}
      label={setting.name}
      description={setting.description}
      thumbnail={
        thumbnailHref ? (
          <a href={thumbnailHref} aria-label={setting.name} className="block size-full">
            {thumbnail}
          </a>
        ) : (
          thumbnail
        )
      }
      control={<Toggle isOn={isOn} onToggle={onToggle} isDisabled={isDisabled} id={toggleId} />}
    />
  );
};

export default ThumbnailNotificationsToggle;
