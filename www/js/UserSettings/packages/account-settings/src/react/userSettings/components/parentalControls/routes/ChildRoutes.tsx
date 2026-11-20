import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import ParentalControlsPageName from "../../../../../enums/parentalControls/ParentalControlsPageName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import { TChildPages } from "../../../../apis/slices/childPagesSlice";
import {
  getLinkedChildDetailsPath,
  getTopGameDetailsRoutePath,
} from "../../../constants/parentalControls/parentalControlsConstants";
import LinkedChildDetails from "../parentDashboard/LinkedChildDetails";
import ConsentCenter from "../parentDashboard/ConsentCenter";
import FriendManagement from "../parentDashboard/FriendManagement";
import EditChildProfile from "../parentDashboard/EditChildProfile";
import useHandleUnlinkChild from "../../../hooks/useHandleUnlinkChild";
import doesUserHaveNotificationSettings from "../../../utils/notificationUtils";
import {
  communicationPageSettings,
  hasAnySetting,
  hasChildNotificationRows,
  tradingAndInventoryPageSettings,
  visibilityPageSettings,
} from "../../../utils/parentalControls/childSettingsMenuUtils";
import AllowThirdPartyAppsSetting from "../../appPermissions/AllowThirdPartyAppsSetting";
import ContentMaturitySlider from "../../privacy/ContentMaturitySlider";
import FriendDiscovery from "../../privacy/FriendDiscovery";
import InventoryTradePrivacy from "../../privacy/InventoryTradePrivacy";
import ChildNotificationSettings from "../parentDashboard/ChildNotificationSettings";
import ChildCommunicationRoutes from "./ChildCommunicationRoutes";
import ChildSpendingRestrictionRoutes from "./ChildSpendingRestrictionRoutes";
import ChildRobuxRoutes from "./ChildRobuxRoutes";
import ChildVisibilityAndPrivateServersRoutes from "./ChildVisibilityAndPrivateServersRoutes";
import ChildContentRestrictionsRoutes from "./ChildContentRestrictionsRoutes";
import ChildSpendingNotifications from "../parentDashboard/ChildSpendingNotifications";
import ChildActivityUpdates from "../parentDashboard/ChildActivityUpdates";
import ChildScreentimeLimit from "../parentDashboard/ChildScreentimeLimit";
import TopGames from "../parentDashboard/TopGames";
import TopGameDetails from "../parentDashboard/TopGameDetails";
import BlockedUsersList from "../../privacy/BlockedUsersList";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import AgeCheck from "../parentDashboard/AgeCheck";
import ChildManageRecommendations from "../parentDashboard/ChildManageRecommendations";
import useHasChildManageRecommendations from "../parentDashboard/useHasChildManageRecommendations";
import ChildPrivacyRequests from "../parentDashboard/ChildPrivacyRequests";

// Defines routes for parents to view and manage their child's details and settings
export const ChildRoutes = ({
  child,
  childPages,
}: {
  child: TChildInfo;
  childPages: TChildPages;
}): JSX.Element => {
  const handleUnlinkChild = useHandleUnlinkChild();

  const [childSettings] = useGetSettingsAndOptions(child.userId);
  const [settingsAndOptionsV2] = useGetSettingsAndOptionsV2(child.userId);
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const showParentalPrivacyRequests = uiPolicy?.selfServeParentalPrivacyRequestsEnabled === true;

  // Only managing the limit depends on this setting, while viewing screen time and top games doesn't.
  const shouldDisplayScreenTimeLimit = useMemo(() => {
    return childSettings?.dailyScreenTimeLimit !== undefined;
  }, [childSettings]);

  const doesChildHaveNotificationSettings = useMemo(
    () =>
      doesUserHaveNotificationSettings(childSettings) &&
      hasChildNotificationRows(child, childSettings, settingsAndOptionsV2),
    [child, childSettings, settingsAndOptionsV2],
  );

  // Each menu below also needs user-settings to return at least one of its rows' settings,
  // so it doesn't render empty when user-settings stops offering them to the parent.
  const showVisibilityAndPrivateServers =
    child.canParentAccessChildBasicPrivacySettings &&
    (hasAnySetting(visibilityPageSettings, childSettings, settingsAndOptionsV2) ||
      !!childSettings?.[UserSetting.privateServerPrivacy]);

  const showTradingAndInventory =
    child.canParentAccessChildBasicPrivacySettings &&
    hasAnySetting(tradingAndInventoryPageSettings, childSettings);

  const showCommunication =
    (child.canParentAccessChildBasicPrivacySettings ||
      child.canParentViewChildCreatorCollaborationSettings ||
      child.canParentManageChildsCommunicationSettings ||
      child.canParentManageChildsInExperienceDirectChatSetting ||
      child.canParentManageChildsPresetChatSetting) &&
    hasAnySetting(communicationPageSettings, childSettings, settingsAndOptionsV2);

  const showFriendsAndContacts = useMemo(
    () =>
      childSettings?.[UserSetting.phoneNumberDiscoverability] ||
      child?.canParentViewChildDeviceContactAccessDisclaimer,
    [child, childSettings],
  );

  const showChildContentRestrictions = useMemo(() => {
    return (
      child.canParentManageChildsExperiences ||
      childSettings?.[UserSetting.allowSensitiveIssues] ||
      child.canParentManageChildsPrivatePlaytestSetting
    );
  }, [child, childSettings]);

  const showRobuxSettings =
    child.canParentManageChildRobuxTransferLimits ||
    child.canParentManageChildRobuxTransferSettings;

  const showFae = useMemo(() => {
    const childHasFaeSetting = childSettings?.[UserSetting.allowFacialAgeEstimation];
    return Boolean(childHasFaeSetting && uiPolicy?.enableAgeCheckSetting);
  }, [childSettings, uiPolicy]);

  const showIdv = useMemo(
    () =>
      !!child.canParentManageChildsAllowIdentityVerificationSetting &&
      !!settingsAndOptionsV2?.[UserSetting.allowIdentityVerification],
    [child, settingsAndOptionsV2],
  );

  // Manage Recommendations (VLOP, e.g. a child under 18 in Brazil), when user-settings returns the
  // page's settings to the parent. Not the parent's own-tab policy (displayManageRecommendationsTab):
  // a Brazilian adult parent has no tab of their own. Only the menu item waits for the settings,
  // since the page shows its own spinner and retry, and leaves when it has no settings.
  const showManageRecommendations = useHasChildManageRecommendations(child);
  const manageRecommendationsPage =
    childPages.childSettingCategoryPages[SettingCategoryPageName.ManageRecommendations];

  // The "Facial and ID verification" page (SettingCategoryPageName.AgeCheck) hosts both the
  // facial-verification (FAE) toggle and the identity-verification (IDV) toggle. Show it only when
  // either the FAE or the IDV setting applies to the child.
  const showAgeCheckPage = useMemo(() => showFae || showIdv, [showFae, showIdv]);

  const filteredChildCategoryPages: Record<string, TSettingsPage> = useMemo(() => {
    const subpages = { ...childPages?.childSettingCategoryPages };

    if (!child.canParentAccessChildBasicPrivacySettings) {
      delete subpages[PrivacySettingName.ContentMaturity];
    }

    if (!showVisibilityAndPrivateServers) {
      delete subpages[SettingCategoryPageName.VisibilityAndPrivateServers];
    }

    if (!showTradingAndInventory) {
      delete subpages[SettingCategoryPageName.TradingAndInventory];
    }

    if (
      !child.canParentAccessChildBasicPrivacySettings ||
      !childSettings?.[UserSetting.contentAgeRestriction]
    ) {
      delete subpages[PrivacySettingName.ContentMaturity];
    }

    if (!showCommunication) {
      delete subpages[SettingCategoryPageName.Communication];
    }

    if (!child.canParentViewChildSpendRestrictions) {
      delete subpages[SettingCategoryPageName.Spending];
    }

    // The Robux card on the dashboard is the only entry point to this page, so
    // listing it here as well would be a second route to the same place. The
    // route itself stays mounted below, gated on the same permissions the card's
    // link is gated on.
    delete subpages[SettingCategoryPageName.Robux];

    if (!child.shouldParentSeeSpendingInsights) {
      delete subpages[SpendSettingName.SpendNotifications];
    }

    if (!uiPolicy?.enableParentLinkActivityUpdates) {
      delete subpages[ParentalControlsPageName.ActivityUpdates];
    }

    if (!showFriendsAndContacts) {
      delete subpages[SettingCategoryPageName.FriendsAndContacts];
    }

    if (!childSettings?.[UserSetting.allowThirdPartyAppPermissions]) {
      delete subpages[SettingCategoryPageName.ThirdPartyApplications];
    }

    if (!doesChildHaveNotificationSettings) {
      delete subpages[SettingCategoryPageName.Notifications];
    }

    if (!child.canParentManageChildsFriends) {
      delete subpages[PrivacySettingName.BlockedUsers];
    }

    if (showChildContentRestrictions) {
      // Use content restriction menu page instead of content maturity slider
      delete subpages[PrivacySettingName.ContentMaturity];
    } else {
      delete subpages[SettingCategoryPageName.ContentRestrictions];
    }
    if (!showAgeCheckPage) {
      delete subpages[SettingCategoryPageName.AgeCheck];
    }
    if (!showManageRecommendations) {
      delete subpages[SettingCategoryPageName.ManageRecommendations];
    }
    if (!showParentalPrivacyRequests) {
      delete subpages[ParentalControlsPageName.PrivacyRights];
    }
    return subpages;
  }, [
    childPages,
    child,
    showFriendsAndContacts,
    doesChildHaveNotificationSettings,
    childSettings,
    showVisibilityAndPrivateServers,
    showTradingAndInventory,
    showCommunication,
    showChildContentRestrictions,
    showAgeCheckPage,
    showManageRecommendations,
    showParentalPrivacyRequests,
    uiPolicy?.enableParentLinkActivityUpdates,
  ]);

  return (
    <React.Fragment>
      <Route exact path={getLinkedChildDetailsPath(child.userId)}>
        <LinkedChildDetails
          child={child}
          filteredChildCategoryPages={filteredChildCategoryPages}
          shouldDisplayScreenTimeLimit={shouldDisplayScreenTimeLimit}
          showManageRecommendations={showManageRecommendations}
        />
      </Route>

      <Route path={childPages.consentCenterPage.path}>
        <ConsentCenter child={child} />
      </Route>

      {child.canParentViewChildFriends && (
        <Route path={childPages.friendManagementPage.path}>
          <FriendManagement child={child} />
        </Route>
      )}

      <Route path={childPages.editProfilePage.path}>
        <EditChildProfile child={child} handleUnlinkChild={handleUnlinkChild} />
      </Route>

      {shouldDisplayScreenTimeLimit && child.canParentManageChildsScreentime && (
        <Route path={childPages.screenTimeManagementPage.path}>
          <ChildScreentimeLimit child={child} />
        </Route>
      )}

      <Route exact path={childPages.topGamesPage.path}>
        <TopGames child={child} />
      </Route>
      <Route path={getTopGameDetailsRoutePath(child.userId)}>
        <TopGameDetails child={child} />
      </Route>

      {showChildContentRestrictions ? (
        <ChildContentRestrictionsRoutes
          child={child}
          contentRestrictionsPage={
            filteredChildCategoryPages[SettingCategoryPageName.ContentRestrictions] as TSettingsPage
          }
          subpages={childPages.contentRestrictionPages}
        />
      ) : (
        child.canParentAccessChildBasicPrivacySettings &&
        childSettings?.[UserSetting.contentAgeRestriction] && (
          <Route path={filteredChildCategoryPages[PrivacySettingName.ContentMaturity]?.path}>
            <ContentMaturitySlider childUserId={child.userId} />
          </Route>
        )
      )}

      {showVisibilityAndPrivateServers && <ChildVisibilityAndPrivateServersRoutes child={child} />}

      {showTradingAndInventory && (
        <Route path={filteredChildCategoryPages[SettingCategoryPageName.TradingAndInventory]?.path}>
          <InventoryTradePrivacy childUserId={child.userId} />
        </Route>
      )}

      {showCommunication && (
        <ChildCommunicationRoutes
          communicationPage={
            filteredChildCategoryPages[SettingCategoryPageName.Communication] as TSettingsPage
          }
          subpages={childPages.communicationPages}
          child={child}
        />
      )}

      {child.canParentViewChildSpendRestrictions && (
        <ChildSpendingRestrictionRoutes child={child} />
      )}

      {showRobuxSettings && <ChildRobuxRoutes child={child} />}

      {child.shouldParentSeeSpendingInsights && (
        <Route path={filteredChildCategoryPages[SpendSettingName.SpendNotifications]?.path}>
          <ChildSpendingNotifications child={child} />
        </Route>
      )}

      {uiPolicy?.enableParentLinkActivityUpdates && (
        <Route path={filteredChildCategoryPages[ParentalControlsPageName.ActivityUpdates]?.path}>
          <ChildActivityUpdates child={child} />
        </Route>
      )}

      {showFriendsAndContacts && (
        <Route path={filteredChildCategoryPages[SettingCategoryPageName.FriendsAndContacts]?.path}>
          <FriendDiscovery child={child} />
        </Route>
      )}

      {childSettings?.[UserSetting.allowThirdPartyAppPermissions] && (
        <Route
          path={filteredChildCategoryPages[SettingCategoryPageName.ThirdPartyApplications]?.path}
        >
          <AllowThirdPartyAppsSetting childUserId={child.userId} />
        </Route>
      )}

      {doesChildHaveNotificationSettings && (
        <Route path={filteredChildCategoryPages[SettingCategoryPageName.Notifications]?.path}>
          <ChildNotificationSettings child={child} />
        </Route>
      )}

      {child.canParentManageChildsFriends && (
        <Route path={filteredChildCategoryPages[PrivacySettingName.BlockedUsers]?.path}>
          <BlockedUsersList child={child} shouldShowParentalRelationshipView />
        </Route>
      )}
      {showAgeCheckPage && (
        <Route path={filteredChildCategoryPages[SettingCategoryPageName.AgeCheck]?.path}>
          <AgeCheck child={child} showFae={showFae} showIdv={showIdv} />
        </Route>
      )}
      {manageRecommendationsPage && (
        <Route path={manageRecommendationsPage.path}>
          <ChildManageRecommendations child={child} />
        </Route>
      )}
      {showParentalPrivacyRequests && (
        <Route path={filteredChildCategoryPages[ParentalControlsPageName.PrivacyRights]?.path}>
          <ChildPrivacyRequests child={child} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildRoutes;
