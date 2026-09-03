// Since the notification stream is angularjs code, the notification-stream-indicator below is for
// notification stream code to engage with navigation component
import { MouseEventHandler, useState, useEffect } from "react";
// @ts-expect-error TODO: remove this once React notification stream is ready
import angular from "angular";
import { ValueOf } from "@rbx/core-types";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import localStorageService from "@rbx/core-scripts/local-storage";
import { createSystemFeedback } from "@rbx/core-ui";
import {
  getUserCurrency,
  getGuacBehavior,
  getRobuxBadge,
  getCreditBalanceForNavigation,
} from "../services/navigationService";
import DownloadAppNavItem from "../components/DownloadAppNavItem";
import NotificationStreamPopover from "../components/NotificationStreamPopover";
import SettingsPopover from "../components/SettingsPopover";
import BuyRobuxPopover from "../components/robux-popover/BuyRobuxPopover";
import UniverseSearchIcon from "../components/UniverseSearchIcon";
import { getAccountNotificationCount } from "../util/navigationUtil";
import AgeBracketDisplay from "../components/AgeBracketDisplay";
import layoutConstants from "../constants/layoutConstants";
import RobuxBadgeType from "../constants/robuxBadgeConstants";
import { shouldShowRobuxUpdateBadge } from "../util/robuxBadgeUtil";

const [SystemFeedback, systemFeedbackService] = createSystemFeedback();

export default function HeaderIconsGroup({
  toggleUniverseSearch,
}: {
  toggleUniverseSearch: MouseEventHandler;
}) {
  const { translate } = useTranslation();
  const user = authenticatedUser();
  const userId = user?.id;
  const [accountNotificationCount, setAccountNotificationCount] = useState(0);
  const [isGetCurrencyCallDone, setGetCurrencyCallDone] = useState(false);
  const [robuxAmount, setRobuxAmount] = useState(0);
  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [canAccessStream, setCanAccessStream] = useState(true);
  const [robuxBadgeType, setRobuxBadgeType] = useState<ValueOf<typeof RobuxBadgeType> | null>(null);
  const [robuxError, setRobuxError] = useState("");
  const [creditDisplayConfig, setCreditDisplayConfig] = useState<
    ValueOf<typeof layoutConstants.creditDisplayConfigVariants>
  >(layoutConstants.creditDisplayConfigVariants.control);
  const [creditAmount, setCreditAmount] = useState(0);
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [creditError, setCreditError] = useState("");
  // wait for experiment to load before loading Robux wallet icons
  const [isExperimentCallDone, setIsExperimentCallDone] = useState(false);

  const getUserCurrencyLocal = () => {
    if (userId != null) {
      setGetCurrencyCallDone(false);
      // Set Robux amount
      getUserCurrency(userId)
        .then(
          ({ data: usercurrencyData }) => {
            setRobuxAmount(usercurrencyData.robux);
          },
          () => {
            const untranslatedMessage = layoutConstants.economySystemOutageMessage;
            const translatedMessage = translate(untranslatedMessage);
            setRobuxError(translatedMessage || untranslatedMessage);
          },
        )
        .finally(() => {
          setGetCurrencyCallDone(true);
        });
    }
  };
  const getVngMetadata = () => {
    if (user != null) {
      getGuacBehavior().then(
        guacData => {
          setIsEligibleForVng(guacData.shouldShowVng);
          setCanAccessStream(guacData.notificationsCanAccessStream);
        },
        () => {
          setRobuxError(translate(layoutConstants.economySystemOutageMessage));
        },
      );
    }
  };
  const getRobuxBadgeLocal = () => {
    if (user != null) {
      getRobuxBadge()
        .then(({ data: robuxBadgeData }) => {
          const robuxUpdateBadge = shouldShowRobuxUpdateBadge();

          // interpret is_virtual_item_available as indicating we should
          // show the 'New Update' badge, overriding the virtual item badge in all cases.

          // const prevLocalVirtualItemStartTimeSeconds =
          //   getRobuxBadgeLocalStorage(RobuxBadgeType.VIRTUAL_ITEM) || -1;

          if (
            robuxBadgeData.is_virtual_item_available &&
            robuxUpdateBadge
            // prevLocalVirtualItemStartTimeSeconds <
            //   robuxBadgeData.active_virtual_item_start_time_seconds_utc
          ) {
            setRobuxBadgeType(robuxUpdateBadge);
            // setRobuxBadgeType(RobuxBadgeType.VIRTUAL_ITEM);
          }
        })
        .catch((error: unknown) => {
          if (
            error != null &&
            typeof error === "object" &&
            (error as Record<string, unknown>).status === 403
          ) {
            setRobuxBadgeType(null);
          } else if (error) {
            throw error;
          }
        });
    }
  };

  useEffect(() => {
    window.addEventListener(`navigation-update-user-currency`, () => {
      getUserCurrencyLocal();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user != null) {
      // Set account notification count
      getAccountNotificationCount().then(setAccountNotificationCount);

      getUserCurrencyLocal();

      // Get vng metadata
      getVngMetadata();

      // Get Robux badge data
      getRobuxBadgeLocal();

      // Set credit amount
      getCreditBalanceForNavigation()
        .then(
          ({ data: creditData }) => {
            if (
              creditData.creditDisplayConfig === null ||
              creditData.creditBalance === null ||
              creditData.creditBalance === 0 ||
              creditData.currencyCode === null
            ) {
              // if user isn't enrolled in experiment, show control
              // if creditBalance and currencyCode null (for new users), or creditBalance is 0, don't show credit anywhere
              setCreditDisplayConfig(layoutConstants.creditDisplayConfigVariants.control);
            } else {
              setCreditDisplayConfig(creditData.creditDisplayConfig);
            }
            setCreditAmount(creditData.creditBalance ?? 0);
            setCurrencyCode(creditData.currencyCode ?? "USD");
          },
          () => {
            setCreditError(translate(layoutConstants.economySystemOutageMessage));
          },
        )
        .finally(() => {
          setIsExperimentCallDone(true);
        });

      // Conditionally display account switched confirmation banner
      try {
        const accountSwitched = localStorageService.getLocalStorage(
          layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
        );

        if (accountSwitched) {
          systemFeedbackService.success(
            translate(layoutConstants.accountSwitchConfirmationKeys.accountSwitchedMessage, {
              accountName: user.name,
            }),
            0 /* show delay */,
            5000 /* banner duration */,
          );
          localStorageService.removeLocalStorage(
            layoutConstants.accountSwitchConfirmationKeys.accountSwitchedFlag,
          );
        }
      } catch {
        // no op
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  let notificationStream = (
    <li id="navbar-stream" className="navbar-icon-item navbar-stream">
      <span className="nav-robux-icon rbx-menu-item">
        {/* eslint-disable-next-line react/no-unknown-property */}
        <span id="notification-stream-icon-container" notification-stream-indicator="true" />
      </span>
    </li>
  );
  try {
    angular.module("notificationStreamIcon");
    angular.module("notificationStream");
    notificationStream = <NotificationStreamPopover />;
  } catch (err) {
    console.error(err);
  }

  return (
    <ul className="nav navbar-right rbx-navbar-icon-group">
      <SystemFeedback />
      <DownloadAppNavItem />
      <AgeBracketDisplay />
      <UniverseSearchIcon toggleUniverseSearch={toggleUniverseSearch} />
      {canAccessStream && notificationStream}
      <BuyRobuxPopover
        robuxAmount={robuxAmount}
        robuxError={robuxError}
        creditAmount={creditAmount}
        currencyCode={currencyCode}
        creditError={creditError}
        creditDisplayConfig={creditDisplayConfig}
        isEligibleForVng={isEligibleForVng}
        isExperimentCallDone={isExperimentCallDone}
        isGetCurrencyCallDone={isGetCurrencyCallDone}
        robuxBadgeType={robuxBadgeType ?? undefined}
      />
      <SettingsPopover accountNotificationCount={accountNotificationCount} />
    </ul>
  );
}
