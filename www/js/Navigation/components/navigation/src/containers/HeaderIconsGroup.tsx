import { MouseEventHandler, useState, useEffect, useRef } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslations } from "@rbx/www-common/i18n";
import { getGuacBehavior } from "../services/navigationService";
import AccountSwitchedSnackbar from "../components/AccountSwitchedSnackbar";
import useRobuxBalance from "../hooks/useRobuxBalance";
import DownloadAppNavItem from "../components/DownloadAppNavItem";
import NotificationStreamPopover from "../components/NotificationStreamPopover";
import SettingsPopover from "../components/SettingsPopover";
import BuyRobuxPopover from "../components/robux-popover/BuyRobuxPopover";
import UniverseSearchIcon from "../components/UniverseSearchIcon";
import { getAccountNotificationCount } from "../util/navigationUtil";
import AgeBracketDisplay from "../components/AgeBracketDisplay";
import layoutConstants from "../constants/layoutConstants";

export default function HeaderIconsGroup({
  toggleUniverseSearch,
}: {
  toggleUniverseSearch: MouseEventHandler;
}) {
  const tMessages = useTranslations("CommonUI.Messages");
  const user = authenticatedUser();
  const streamItemRef = useRef<HTMLLIElement>(null);
  const [accountNotificationCount, setAccountNotificationCount] = useState(0);
  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [canAccessStream, setCanAccessStream] = useState(true);
  const [vngMetadataError, setVngMetadataError] = useState("");
  const robuxBalance = useRobuxBalance();

  const getVngMetadata = () => {
    if (user != null) {
      getGuacBehavior().then(
        guacData => {
          setVngMetadataError("");
          setIsEligibleForVng(guacData.shouldShowVng);
          setCanAccessStream(guacData.notificationsCanAccessStream);
        },
        () => {
          setVngMetadataError(tMessages(layoutConstants.economySystemOutageMessage));
        },
      );
    }
  };

  useEffect(() => {
    if (user != null) {
      // Set account notification count
      getAccountNotificationCount().then(setAccountNotificationCount);

      // Get vng metadata
      getVngMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const notificationStream = (
    <li
      id="navbar-stream"
      ref={streamItemRef}
      className="navbar-icon-item navbar-stream notification-margins"
    >
      <NotificationStreamPopover containerRef={streamItemRef} />
    </li>
  );

  return (
    <ul className="[&>li]:relative navbar-right rbx-navbar-icon-group">
      <AccountSwitchedSnackbar />
      <AgeBracketDisplay />
      <UniverseSearchIcon toggleUniverseSearch={toggleUniverseSearch} />
      {canAccessStream && notificationStream}
      <BuyRobuxPopover
        {...robuxBalance}
        robuxError={robuxBalance.robuxError || vngMetadataError}
        isEligibleForVng={isEligibleForVng}
      />
      <SettingsPopover accountNotificationCount={accountNotificationCount} />
      <DownloadAppNavItem />
    </ul>
  );
}
