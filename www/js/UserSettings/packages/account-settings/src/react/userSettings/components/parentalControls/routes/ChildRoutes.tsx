import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import ParentalControlsPageName from "../../../../../enums/parentalControls/ParentalControlsPageName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
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
import AllowThirdPartyAppsSetting from "../../appPermissions/AllowThirdPartyAppsSetting";
import ContentMaturitySlider from "../../privacy/ContentMaturitySlider";
import FriendDiscovery from "../../privacy/FriendDiscovery";
import InventoryTradePrivacy from "../../privacy/InventoryTradePrivacy";
import ChildNotificationSettings from "../parentDashboard/ChildNotificationSetings";
import ChildCommunicationRoutes from "./ChildCommunicationRoutes";
import ChildSpendingRestrictionRoutes from "./ChildSpendingRestrictionRoutes";
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
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const shouldDisplayScreenTime = useMemo(() => {
    return childSettings?.dailyScreenTimeLimit !== undefined;
  }, [childSettings]);

  const doesChildHaveNotificationSettings = useMemo(
    () => doesUserHaveNotificationSettings(childSettings),
    [childSettings],
  );

  const showFriendsAndContacts = useMemo(
    () =>
      childSettings?.[UserSetting.phoneNumberDiscoverability] ||
      child?.canParentViewChildDeviceContactAccessDisclaimer,
    [child, childSettings],
  );

  const showChildContentRestrictions = useMemo(() => {
    return (
      child.canParentManageChildsExperiences || childSettings?.[UserSetting.allowSensitiveIssues]
    );
  }, [child, childSettings]);

  const showAgeCheckPage = useMemo(() => {
    const childHasFaeSetting = childSettings?.[UserSetting.allowFacialAgeEstimation];
    return (
      (childHasFaeSetting && uiPolicy?.enableAgeCheckSetting) ||
      (child.canParentViewChildCreatorCollaborationSettings &&
        uiPolicy?.vpcForFaeCreatorCollabSettingEnabled)
    );
  }, [childSettings, uiPolicy, child]);

  const filteredChildCategoryPages: Record<string, TSettingsPage> = useMemo(() => {
    const subpages = { ...childPages?.childSettingCategoryPages };

    if (!child.canParentAccessChildBasicPrivacySettings) {
      delete subpages[PrivacySettingName.ContentMaturity];
      delete subpages[SettingCategoryPageName.VisibilityAndPrivateServers];
      delete subpages[SettingCategoryPageName.TradingAndInventory];
    }

    if (
      !child.canParentAccessChildBasicPrivacySettings &&
      !child.canParentViewChildCreatorCollaborationSettings &&
      !child.canParentManageChildsCommunicationSettings &&
      !child.canParentManageChildsInExperienceDirectChatSetting &&
      !child.canParentManageChildsPresetChatSetting
    ) {
      delete subpages[SettingCategoryPageName.Communication];
    }

    if (!child.canParentViewChildSpendRestrictions) {
      delete subpages[SettingCategoryPageName.Spending];
    }

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
    return subpages;
  }, [
    childPages,
    child,
    showFriendsAndContacts,
    doesChildHaveNotificationSettings,
    childSettings,
    showChildContentRestrictions,
    showAgeCheckPage,
    uiPolicy?.enableParentLinkActivityUpdates,
  ]);

  return (
    <React.Fragment>
      <Route exact path={getLinkedChildDetailsPath(child.userId)}>
        <LinkedChildDetails
          child={child}
          filteredChildCategoryPages={filteredChildCategoryPages}
          shouldDisplayScreenTimeLimit={shouldDisplayScreenTime}
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

      {shouldDisplayScreenTime && child.canParentManageChildsScreentime && (
        <Route path={childPages.screenTimeManagementPage.path}>
          <ChildScreentimeLimit child={child} />
        </Route>
      )}

      {shouldDisplayScreenTime && (
        <React.Fragment>
          <Route exact path={childPages.topGamesPage.path}>
            <TopGames child={child} />
          </Route>
          <Route path={getTopGameDetailsRoutePath(child.userId)}>
            <TopGameDetails child={child} />
          </Route>
        </React.Fragment>
      )}

      {showChildContentRestrictions ? (
        <ChildContentRestrictionsRoutes
          child={child}
          contentRestrictionsPage={
            filteredChildCategoryPages[SettingCategoryPageName.ContentRestrictions] as TSettingsPage
          }
          subpages={childPages.contentRestrictionPages}
        />
      ) : (
        child.canParentAccessChildBasicPrivacySettings && (
          <Route path={filteredChildCategoryPages[PrivacySettingName.ContentMaturity]?.path}>
            <ContentMaturitySlider childUserId={child.userId} />
          </Route>
        )
      )}

      {child.canParentAccessChildBasicPrivacySettings && (
        <React.Fragment>
          <ChildVisibilityAndPrivateServersRoutes child={child} />

          <Route
            path={filteredChildCategoryPages[SettingCategoryPageName.TradingAndInventory]?.path}
          >
            <InventoryTradePrivacy childUserId={child.userId} />
          </Route>
        </React.Fragment>
      )}

      {(child.canParentAccessChildBasicPrivacySettings ||
        child.canParentViewChildCreatorCollaborationSettings ||
        child.canParentManageChildsCommunicationSettings ||
        child.canParentManageChildsInExperienceDirectChatSetting ||
        child.canParentManageChildsPresetChatSetting) && (
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
          <AgeCheck child={child} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildRoutes;
