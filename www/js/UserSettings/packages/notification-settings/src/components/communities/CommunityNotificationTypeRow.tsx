import { JSX } from "react";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { SettingControlItem } from "@rbx/user-settings";
import { Toggle } from "@rbx/core-ui/legacy/react-style-guide";
import type { CommunityNotificationTypeRowFragment$key } from "./__generated__/CommunityNotificationTypeRowFragment.graphql";
import CommunityNotificationTypeRowFragmentNode from "./__generated__/CommunityNotificationTypeRowFragment.graphql";
import type { GroupNotificationPreference } from "../../services/groupsService";
import { getEnabledNotificationChannels } from "../../utils/presentationUtils";
import { CHANNEL_KEYS } from "../../constants/notificationConstants";

type CommunityNotificationTypeRowProps = {
  pref: GroupNotificationPreference;
  toggleId: string;
  globalNotificationType: CommunityNotificationTypeRowFragment$key | undefined;
  updating: boolean;
  onToggle: () => void;
};

/**
 * Renders a toggle row for a single notification type belonging to a specific
 * community (e.g. the "Announcements" notification type for a given community).
 *
 * Each community can have multiple notification types (Announcements, etc.), and
 * this component represents one such type-for-community pair. The row reflects
 * and controls whether the user wants to receive that particular notification
 * type for that particular community, and surfaces channel state (push / email /
 * in-app) from the corresponding global notification type setting, which owns
 * the channel configuration.
 */
export const CommunityNotificationTypeRow = ({
  pref,
  toggleId,
  globalNotificationType,
  updating,
  onToggle,
}: CommunityNotificationTypeRowProps): JSX.Element => {
  const { translate } = useTranslation();
  const settingData = useFragment(
    CommunityNotificationTypeRowFragmentNode,
    globalNotificationType ?? null,
  );

  // Notification center is always one of the channels for community notification
  // types, so the global channel state can never be fully off; the on/off state
  // for this row is driven entirely by the per-community-type preference.
  const description = settingData
    ? getEnabledNotificationChannels(settingData.channels, translate, [
        CHANNEL_KEYS.notificationCenter,
      ])
    : undefined;

  return (
    <SettingControlItem
      id={toggleId}
      label={pref.name}
      description={description}
      control={
        <Toggle id={toggleId} isOn={pref.enabled} onToggle={onToggle} isDisabled={updating} />
      }
    />
  );
};

export default CommunityNotificationTypeRow;
