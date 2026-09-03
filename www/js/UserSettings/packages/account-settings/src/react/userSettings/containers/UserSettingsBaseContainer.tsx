import React, { ReactChild, useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { Loading, SimpleTab, SimpleTabs } from "react-style-guide";
import { deviceMeta } from "header-scripts";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { Dropdown, Menu, MenuSection, MenuItem } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import RouterPath from "../../../enums/RouterPath";
import { TDropdownOption } from "../../../types/commonTypes";
import { TTabData } from "../../../types/navigationTypes";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import { getRouterRelativePath, shouldWaitForRedirectionChecks } from "../utils/navigationUtils";
import AccountInfoContainer from "./AccountInfoContainer";
import AppPermissionsContainer from "./AppPermissionsContainer";
import NotificationSettingsContainer from "./NotificationSettingsContainer";
import PaymentMethodSettingsContainer from "./PaymentMethodsSettingsContainer";
import SecuritySettingsContainer from "./SecuritySettingsContainer";
import { AccountHeaderContainer } from "./AccountHeaderContainer";
import { RobuxSettingsContainer } from "./RobuxSettingsContainer";
import SubscriptionsSettingsContainer from "./SubscriptionsSettingsContainer";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import {
  useGetSettingsMetadataQuery,
  useGetUserSettingsAndOptionsQuery,
  useGetUserSettingsQuery,
} from "../../apis/userSettingsApi";
import MobileDropdownNameUpdater from "./MobileDropdownNameUpdater";
import SettingsTabViewLogger from "./SettingsTabViewLogger";
import { refetchUserSettingsEventName } from "../constants/baseContants";
import ParentalControlsContainer from "./ParentalControlsContainer";
import PrivacySettingsContainer from "./PrivacySettingsContainer";
import userSettingsApi from "../constants/metricConstants";
import BrowserPreferencesContainer from "./BrowserPreferencesContainer";
import RedirectHandlers from "../components/RedirectHandlers";
import { redirectionCheckCompleteEventName } from "../utils/hybridViewUtils";
import eventTracker from "../../../common/eventTracker";

export const UserSettingsBaseContainer = (): JSX.Element => {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const { data: settingsUiPolicy, status: settingsUiPolicyStatus } = useGetSettingsUiPolicyQuery();

  const {
    data: userSettings,
    status: userSettingsStatus,
    refetch: refetchUserSettings,
  } = useGetUserSettingsQuery();
  const { data: userSettingsMetadata, status: userSettingsMetadataStatus } =
    useGetSettingsMetadataQuery();
  const {
    data: settingsAndOptions,
    status: settingsAndOptionsStatus,
    refetch: refetchSettingsAndOptions,
  } = useGetUserSettingsAndOptionsQuery();
  const [isError, setIsError] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);

  const [tabsView, setTabsView] = useState<ReactChild[]>([]);

  // Initialize tabsData with all tabs so that navigation to the tab URL directly works
  const [tabsData, setTabsData] = useState<TTabData[]>([
    {
      id: RouterPath.Info,
      path: `/${RouterPath.Info}`,
      title: navigationTranslationConstants.accountInfoHeading,
      name: RouterPath.Info,
      isDefault: true,
      show: true,
      content: <AccountInfoContainer />,
    },
    {
      id: RouterPath.Security,
      path: `/${RouterPath.Security}`,
      title: navigationTranslationConstants.securityHeading,
      name: RouterPath.Security,
      isDefault: false,
      show: true,
      content: <SecuritySettingsContainer />,
    },
    {
      id: RouterPath.Privacy,
      path: `/${RouterPath.Privacy}`,
      title: navigationTranslationConstants.privacyContentMaturityHeading,
      name: RouterPath.Privacy,
      isDefault: false,
      show: true,
      content: <PrivacySettingsContainer />,
    },
    {
      id: RouterPath.Notifications,
      path: `/${RouterPath.Notifications}`,
      title: navigationTranslationConstants.notificationsHeading,
      name: RouterPath.Notifications,
      isDefault: false,
      show: true,
      content: <NotificationSettingsContainer />,
    },
    {
      id: RouterPath.Billing,
      path: `/${RouterPath.Billing}`,
      title: navigationTranslationConstants.billingHeading,
      name: RouterPath.Billing,
      isDefault: false,
      show: true,
      content: <PaymentMethodSettingsContainer />,
    },
    {
      id: RouterPath.Robux,
      path: `/${RouterPath.Robux}`,
      title: navigationTranslationConstants.robuxHeading,
      name: RouterPath.Robux,
      isDefault: false,
      show: true,
      content: <RobuxSettingsContainer />,
    },
    {
      id: RouterPath.Subscriptions,
      path: `/${RouterPath.Subscriptions}`,
      title: navigationTranslationConstants.subscriptionsHeading,
      name: RouterPath.Subscriptions,
      isDefault: false,
      show: true,
      content: <SubscriptionsSettingsContainer />,
    },
    {
      id: RouterPath.ParentalControls,
      path: `/${RouterPath.ParentalControls}`,
      title: navigationTranslationConstants.parentalControlsHeading,
      isDefault: false,
      name: RouterPath.ParentalControls,
      show: true,
      content: <ParentalControlsContainer />,
    },
    {
      id: RouterPath.AppPermissions,
      path: `/${RouterPath.AppPermissions}`,
      title: navigationTranslationConstants.appPermissionsHeading,
      isDefault: false,
      name: RouterPath.AppPermissions,
      show: true,
      content: <AppPermissionsContainer />,
    },
    {
      id: RouterPath.BrowserPreferences,
      path: `/${RouterPath.BrowserPreferences}`,
      title: navigationTranslationConstants.browserPreferencesHeading,
      isDefault: false,
      name: RouterPath.BrowserPreferences,
      show: !deviceMeta.getDeviceMeta()?.isInApp,
      content: <BrowserPreferencesContainer />,
    },
  ]);

  // This mobile dropdown is hacky and breaks the routing abstraction
  // But it's temporary as we will be updating the settings navigation very soon (tm)
  const [currMobileTab, setCurrMobileTab] = useState<RouterPath>(
    window.location.hash.split("/")[1] as RouterPath,
  );
  const [mobileDropdownOptions, setMobileDropdownOptions] = useState<TDropdownOption[]>([]);

  const mobileDropdown = (
    <div className="mobile-navigation-dropdown">
      <Dropdown
        value={currMobileTab}
        size="Medium"
        placeholder=""
        onValueChange={(value: string) => {
          window.location.href = getRouterRelativePath(value as RouterPath);
          setCurrMobileTab(value as RouterPath);
        }}
      >
        <Menu>
          <MenuSection>
            {mobileDropdownOptions.map((option: TDropdownOption) => (
              <MenuItem
                key={String(option.key)}
                title={translate(option.label)}
                value={String(option.value)}
              />
            ))}
          </MenuSection>
        </Menu>
      </Dropdown>
    </div>
  );

  const [awaitingRedirectDecision, setAwaitingRedirectDecision] = useState<boolean>(
    shouldWaitForRedirectionChecks(),
  );

  useEffect(() => {
    const onRedirectCheckComplete = () => setAwaitingRedirectDecision(false);
    window.addEventListener(
      redirectionCheckCompleteEventName,
      onRedirectCheckComplete as EventListener,
    );
    return () => {
      window.removeEventListener(
        redirectionCheckCompleteEventName,
        onRedirectCheckComplete as EventListener,
      );
    };
  }, []);

  const removeTabsFromTabsData = (tabNames: RouterPath[]) => {
    setTabsData(prevTabsData => prevTabsData.filter(tab => !tabNames.includes(tab.name)));
  };

  const renameTab = (tabId: RouterPath, newTitle: string) => {
    setTabsData(prevTabsData =>
      prevTabsData.map(tab => (tab.id === tabId ? { ...tab, title: newTitle } : tab)),
    );
  };

  useEffect(() => {
    const hasPolicyError =
      settingsUiPolicyStatus === QueryStatus.rejected ||
      (settingsUiPolicyStatus === QueryStatus.fulfilled && !settingsUiPolicy);

    if (hasPolicyError) {
      // If we can't fetch settings UI policy, we should remove all policy-driven tabs
      removeTabsFromTabsData([
        RouterPath.Notifications,
        RouterPath.Billing,
        RouterPath.Subscriptions,
        RouterPath.ParentalControls,
        RouterPath.AppPermissions,
      ]);
    }

    let errorMetric:
      | (typeof userSettingsApi.events)[keyof typeof userSettingsApi.events]
      | undefined;
    if (
      userSettingsStatus === QueryStatus.rejected ||
      (userSettingsStatus === QueryStatus.fulfilled && !userSettings)
    ) {
      errorMetric = userSettingsApi.events.statusError;
    } else if (
      userSettingsMetadataStatus === QueryStatus.rejected ||
      (userSettingsMetadataStatus === QueryStatus.fulfilled && !userSettingsMetadata)
    ) {
      errorMetric = userSettingsApi.events.metadataError;
    } else if (
      settingsAndOptionsStatus === QueryStatus.rejected ||
      (settingsAndOptionsStatus === QueryStatus.fulfilled && !settingsAndOptions)
    ) {
      errorMetric = userSettingsApi.events.settingsAndOptionsError;
    } else if (hasPolicyError) {
      errorMetric = userSettingsApi.events.policyError;
    }

    if (errorMetric) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
      setRetryCounter(retryCounter + 1);

      eventTracker?.fireEvent(`${userSettingsApi.prefix}_${errorMetric}`);

      // mitigate user setting api pressure
      // should investigate about unlimited retry: https://roblox.atlassian.net/browse/ACCMAN-2323
      if (retryCounter > 2) {
        setIsError(true);
      }
    }

    // The ESLint warning can be safely ignored if you are sure that the dependencies
    // won't change unexpectedly and cause unwanted effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userSettingsStatus,
    userSettingsMetadataStatus,
    settingsUiPolicyStatus,
    settingsAndOptionsStatus,
  ]);

  useEffect(() => {
    if (settingsUiPolicy) {
      // Remove policy-driven tabs
      const tabsToRemove: RouterPath[] = [];
      if (!settingsUiPolicy?.displayReactNotificationsTab) {
        // GUAC policy excludes under 13 users because we can't prompt them to enable
        // push notifications, so there's no reason for them to be
        // configurable.
        tabsToRemove.push(RouterPath.Notifications);
      }
      if (!settingsUiPolicy?.displaySubscriptionsTab) {
        tabsToRemove.push(RouterPath.Subscriptions);
      }
      if (!settingsUiPolicy?.displayParentalControlTab) {
        tabsToRemove.push(RouterPath.ParentalControls);
      }
      if (!settingsUiPolicy?.displayAppPermissionsTab) {
        tabsToRemove.push(RouterPath.AppPermissions);
      }
      if (tabsToRemove.length > 0) {
        removeTabsFromTabsData(tabsToRemove);
      }

      // Rename policy-named tabs
      if (settingsUiPolicy.renamePaymentsToSpendingTab) {
        renameTab(RouterPath.Billing, navigationTranslationConstants.spendingHeading);
      }
      if (settingsUiPolicy.renamePrivacyToPrivacyContentRestrictionsTab) {
        renameTab(
          RouterPath.Privacy,
          navigationTranslationConstants.privacyContentRestrictionsHeading,
        );
      }
    }

    const isInApp = deviceMeta.getDeviceMeta()?.isInApp;
    if (isInApp) {
      removeTabsFromTabsData([RouterPath.BrowserPreferences]);
    }
  }, [settingsUiPolicy]);

  useEffect(() => {
    setTabsView(
      tabsData.reduce((view: ReactChild[], { path, title, name, isDefault, id, show, content }) => {
        if (show) {
          view.push(
            <SimpleTab
              id={id}
              key={name}
              path={path}
              title={translate(title)}
              name={name}
              isDefault={isDefault}
            >
              <React.Fragment>
                {content}
                {/* Dummy component so that mobile dropdown is set correctly based on the current path */}
                <MobileDropdownNameUpdater
                  key="mobile-dropdown-name-updater"
                  setCurrMobileTab={setCurrMobileTab}
                />
                <SettingsTabViewLogger key="settings-tab-view-logger" tabId={id} />
              </React.Fragment>
            </SimpleTab>,
          );
        }
        return view;
      }, []),
    );
    setMobileDropdownOptions(
      tabsData.map(tab => {
        return {
          key: tab.id,
          label: tab.title,
          value: tab.id,
        };
      }),
    );
  }, [tabsData]);

  const listenToRefetchEvent = async () => {
    await refetchUserSettings();
    await refetchSettingsAndOptions();
  };

  useEffect(() => {
    // Sometimes we want to refetch user settings from other components
    window.addEventListener(refetchUserSettingsEventName, listenToRefetchEvent as EventListener);

    return () => {
      window.removeEventListener(
        refetchUserSettingsEventName,
        listenToRefetchEvent as EventListener,
      );
    };
  }, []);

  return (
    <React.Fragment>
      <AccountHeaderContainer />
      {awaitingRedirectDecision && <Loading />}
      {!isError && !awaitingRedirectDecision && (
        <div id="settings-container">
          {mobileDropdown}
          <SimpleTabs
            hashType="hashbang"
            type="Hash"
            isVertical
            isScrollable={false}
            className="settings-left-navigation"
          >
            {tabsView}
          </SimpleTabs>
        </div>
      )}
      <RedirectHandlers />
    </React.Fragment>
  );
};

export default UserSettingsBaseContainer;
