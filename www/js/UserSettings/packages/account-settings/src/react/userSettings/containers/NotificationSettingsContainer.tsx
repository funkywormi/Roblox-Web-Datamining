import { ProgressCircle } from "@rbx/foundation-ui";
import NotificationSettings from "@rbx/notification-settings";
import { notificationsTabEntryPointId } from "../constants/browserConstants";
import { renderNotificationsTab } from "../userSettingsEntry";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";

export const NotificationSettingsContainer = (): JSX.Element => {
  const {
    data: settingsUiPolicy,
    isLoading: isSettingsUiPolicyLoading,
    isSuccess: isSettingsUiPolicySuccess,
  } = useGetSettingsUiPolicyQuery();

  if (isSettingsUiPolicyLoading) {
    return (
      <div className="flex w-full justify-center py-8">
        <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
      </div>
    );
  }

  if (isSettingsUiPolicySuccess && settingsUiPolicy?.notificationSettingsRedesignEnabled) {
    return <NotificationSettings />;
  } else {
    renderNotificationsTab();
    return <div id={notificationsTabEntryPointId} />;
  }
};

export default NotificationSettingsContainer;
