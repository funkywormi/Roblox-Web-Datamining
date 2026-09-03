import ClassNames from "classnames";

export default function SettingsIcon({
  accountNotificationCount = 0,
}: {
  accountNotificationCount?: number;
}) {
  const notificationClasses = ClassNames("notification-red notification nav-setting-highlight", {
    hidden: accountNotificationCount === 0,
  });
  return (
    <span id="settings-icon" className="nav-settings-icon rbx-menu-item" aria-hidden="true">
      <span className="icon-nav-settings roblox-popover-close" id="nav-settings" />
      <span className={notificationClasses}>{accountNotificationCount}</span>
    </span>
  );
}
