import { JSX } from "react";
import { useFragment } from "react-relay";
import { useTranslation } from "@rbx/core-scripts/react";
import { DoNotDisturbSetting } from "./DoNotDisturbSetting";
import { BackLink } from "../BackLink";
import { ChannelToggle } from "../ChannelToggle";
import translationConstants from "../../constants/translationConstants";
import { ROUTES } from "../../utils/routingUtils";
import type { DeviceNotificationsPageFragment$key } from "./__generated__/DeviceNotificationsPageFragment.graphql";
import DeviceNotificationsPageFragmentNode from "./__generated__/DeviceNotificationsPageFragment.graphql";

type DeviceNotificationsPageProps = {
  notificationsRef: DeviceNotificationsPageFragment$key;
};

export const DeviceNotificationsPage = ({
  notificationsRef,
}: DeviceNotificationsPageProps): JSX.Element => {
  const { translate } = useTranslation();
  const data = useFragment(DeviceNotificationsPageFragmentNode, notificationsRef);

  // Hide settings that have no selectable options
  const visibleChannels = data.channels.filter(
    channel => channel.preference.availableOptions.length > 0,
  );
  const showDoNotDisturb = data.doNotDisturb.enabled.availableOptions.length > 0;

  return (
    <div className="device-notifications-page">
      <BackLink
        currentPagePath={ROUTES.deviceNotifications}
        titleTranslationKey={translationConstants.deviceNotificationsHeading}
      />
      <span className="text-body-medium">
        {translate(translationConstants.deviceNotificationsSettingsDescription)}
      </span>

      {visibleChannels.length > 0 && (
        <div className="device-toggles mt-large">
          {visibleChannels.map(channel => (
            <ChannelToggle key={channel.channel.value} channelRef={channel} isDeviceChannel />
          ))}
        </div>
      )}

      {visibleChannels.length > 0 && showDoNotDisturb && (
        <div className="rbx-divider mt-large mb-large" />
      )}

      {showDoNotDisturb && <DoNotDisturbSetting doNotDisturbRef={data.doNotDisturb} />}
    </div>
  );
};

export default DeviceNotificationsPage;
