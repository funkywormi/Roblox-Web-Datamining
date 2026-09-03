import React, { useEffect, useMemo } from "react";
import { Route, useLocation } from "react-router-dom";
import { authenticatedUser } from "header-scripts";
import { LegallySensitiveContentService } from "Roblox";
import { Access } from "../../../types/accessManagementTypes";
import PrivacySettingName from "../../../enums/privacy/PrivacySettingName";
import SettingCategoryPageName from "../../../enums/SettingCategoryPageName";
import { TSettingsPage } from "../../../types/commonTypes";
import RouterPath from "../../../enums/RouterPath";
import privacyTranslationConstants from "../constants/contentConstants/privacyTranslationConstants";
import {
  privacySettingCategoryPages,
  allPrivacyPages,
  basePrivacyPath,
  screentimePages,
  legallySensitivePageTitleMap,
} from "../constants/privacy/privacyConstants";
import SettingsList from "../../common/components/routing/SettingsList";
import CommunicationRoutes from "../components/privacy/routes/CommunicationRoutes";
import VisibilityAndPrivateServersRoutes from "../components/privacy/routes/VisibilityAndPrivateServersRoutes";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import BackLink from "../../common/components/routing/BackLink";
import { useGetSettingsMetadataQuery } from "../../apis/userSettingsApi";
import Screentime from "../components/privacy/Screentime";
import { useGetAccountInfoQuery } from "../../apis/legacyAccountSettingsApi";
import { sendPrivacyPageloadEvent } from "../services/eventServices/privacyEventService";
import { selectSettingConsentRequirements } from "../../apis/slices/parentalConsentSlice";
import { useAppSelector } from "../../redux/hooks";
import useGetSettingsAndOptions from "../../apis/hooks/useGetSettingsAndOptions";
import ContentMaturitySlider from "../components/privacy/ContentMaturitySlider";
import InventoryTradePrivacy from "../components/privacy/InventoryTradePrivacy";
import AdPreferences from "../components/privacy/AdPreferences";
import FriendsAndContacts from "../components/privacy/FriendsAndContacts";
import AccountDeactivationAndDeletion from "../components/privacy/AccountDeactivationAndDeletion";
import TopGames from "../components/parentalControls/parentDashboard/TopGames";
import { useGetFeatureAccessQuery } from "../../apis/accessManagementApi";
import AMPFeaturesConstants from "../constants/AMPFeaturesConstants";
import ContentRestrictionsRoutes from "../components/privacy/routes/ContentRestrictionsRoutes";
import BlockedUsers from "../components/privacy/BlockedUsers";
import useWrappedTranslation from "../hooks/useWrappedTranslation";

export const PrivacySettingsContainer = (): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const location = useLocation();
  const pathNameNoTrailingSlash = location.pathname.replace(/\/$/, "");
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: userSettingsMetadata } = useGetSettingsMetadataQuery();
  const [settingsAndOptions] = useGetSettingsAndOptions();
  const settingConsentRequirements = useAppSelector(
    selectSettingConsentRequirements(authenticatedUser.id!),
  );

  useEffect(() => {
    if (settingConsentRequirements) {
      sendPrivacyPageloadEvent(pathNameNoTrailingSlash, settingConsentRequirements);
    }
  }, [pathNameNoTrailingSlash, settingConsentRequirements]);

  const displaySelfServeAccountDeletionPage = useMemo(() => {
    return (
      uiPolicy?.selfServeDataAccessEnabled === true ||
      uiPolicy?.selfServeAccountDeletionEnabled === true
    );
  }, [uiPolicy]);

  const currentPage = useMemo(() => {
    const page = allPrivacyPages.find(p => p.path === pathNameNoTrailingSlash);
    return page;
  }, [pathNameNoTrailingSlash]);

  const currentLegallySensitiveMapping = currentPage
    ? legallySensitivePageTitleMap[currentPage.name]
    : undefined;
  const [legallySensitiveContent] =
    LegallySensitiveContentService.useLegallySensitiveContentAndActions(
      currentLegallySensitiveMapping?.consentName ?? "",
      currentLegallySensitiveMapping?.surfaceName ?? "",
    );
  const legallySensitivePageTitle = currentLegallySensitiveMapping
    ? legallySensitiveContent?.wordsOfConsent?.pageTitle
    : undefined;

  const displayAccountDeactivationAndDeletion = useMemo(() => {
    return uiPolicy?.displayAccountDeletion || uiPolicy?.displayAccountDeactivation;
  }, [uiPolicy]);

  const displayFriendsAndContacts = useMemo(() => {
    return uiPolicy?.displayPhoneNumber && userSettingsMetadata?.isDiscoverabilitySettingsEnabled;
  }, [uiPolicy, accountInfo, userSettingsMetadata]);

  const displayScreentime = useMemo(() => {
    return settingsAndOptions?.dailyScreenTimeLimit !== undefined;
  }, [settingsAndOptions]);

  const { data: displayBlockedExperiencesResult } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.CanParentManageChildsExperiences,
  });

  const showContentRestrictions = useMemo(() => {
    return (
      displayBlockedExperiencesResult?.access === Access.Granted ||
      settingsAndOptions?.allowSensitiveIssues
    );
  }, [displayBlockedExperiencesResult, settingsAndOptions]);

  const privacySettingSubpages: Record<string, TSettingsPage> = useMemo(() => {
    const subpages: Record<string, TSettingsPage> = { ...privacySettingCategoryPages };

    if (!displayAccountDeactivationAndDeletion) {
      delete subpages[PrivacySettingName.AccountDeactivationAndDeletion];
      delete subpages[PrivacySettingName.AccountDataDeactivationAndDeletion];
    } else if (displaySelfServeAccountDeletionPage) {
      delete subpages[PrivacySettingName.AccountDeactivationAndDeletion];
    } else {
      delete subpages[PrivacySettingName.AccountDataDeactivationAndDeletion];
    }
    if (!displayFriendsAndContacts) {
      delete subpages[SettingCategoryPageName.FriendsAndContacts];
    }
    if (!userSettingsMetadata?.displayAdsSettings) {
      delete subpages[PrivacySettingName.AdPreferences];
    }
    if (!displayScreentime) {
      delete subpages[PrivacySettingName.Screentime];
    }
    if (showContentRestrictions) {
      // Use content restriction menu page instead of content maturity slider
      delete subpages[PrivacySettingName.ContentMaturity];
    } else {
      delete subpages[SettingCategoryPageName.ContentRestrictions];
    }

    // TODO: Add additional filtering if users are ineligible for some settings
    return subpages;
  }, [
    displayAccountDeactivationAndDeletion,
    userSettingsMetadata,
    displayFriendsAndContacts,
    displayScreentime,
    showContentRestrictions,
    displaySelfServeAccountDeletionPage,
  ]);

  /* TODO ACCMAN-1915: The current approach is somewhat hacky because the privacy tab is wrapped in a Switch router within the UserSettingsBaseContainer.
  This router uses exclusive routing, causing only the outer privacy wrapper container to be displayed.
  Therefore, we need to verify if we're on the privacy categories list page to display the appropriate navigation.
  This issue will be resolved when we refactor the outer router. */
  const isCurrentlyOnPrivacyCategoriesListPage: boolean = useMemo(
    () => pathNameNoTrailingSlash.slice(1) === RouterPath.Privacy,
    [pathNameNoTrailingSlash],
  );

  return (
    <div className="settings-container-v2">
      <div className="settings-v2-header" id="rbx-privacy-settings-header">
        <h2>
          {translate(
            privacyTranslationConstants.pageTitles[
              SettingCategoryPageName.PrivacySettingCategoriesList
            ],
          )}
        </h2>
      </div>

      {!isCurrentlyOnPrivacyCategoriesListPage && (
        // Only show the back button if we are within privacy setting subpages
        <BackLink
          basePath={basePrivacyPath}
          titleTranslationKey={
            currentPage?.titleTranslationKey ??
            privacyTranslationConstants.pageTitles.PrivacySettingCategoriesList
          }
          title={legallySensitivePageTitle}
          currentPagePath={currentPage?.path}
        />
      )}

      {isCurrentlyOnPrivacyCategoriesListPage && (
        <SettingsList subPages={privacySettingSubpages} isMainMenu />
      )}
      {showContentRestrictions ? (
        <ContentRestrictionsRoutes />
      ) : (
        <Route path={privacySettingCategoryPages[PrivacySettingName.ContentMaturity].path}>
          <ContentMaturitySlider />
        </Route>
      )}

      <CommunicationRoutes />

      <VisibilityAndPrivateServersRoutes />

      <Route path={privacySettingCategoryPages[SettingCategoryPageName.TradingAndInventory].path}>
        <InventoryTradePrivacy />
      </Route>

      {userSettingsMetadata?.displayAdsSettings && (
        <Route path={privacySettingCategoryPages[PrivacySettingName.AdPreferences].path}>
          <AdPreferences />
        </Route>
      )}

      {displayFriendsAndContacts && (
        <Route path={privacySettingCategoryPages[SettingCategoryPageName.FriendsAndContacts].path}>
          <FriendsAndContacts />
        </Route>
      )}

      <Route path={privacySettingCategoryPages[PrivacySettingName.BlockedUsers].path}>
        <BlockedUsers />
      </Route>

      {displayAccountDeactivationAndDeletion && (
        <Route
          path={
            displaySelfServeAccountDeletionPage
              ? privacySettingCategoryPages[PrivacySettingName.AccountDataDeactivationAndDeletion]
                  .path
              : privacySettingCategoryPages[PrivacySettingName.AccountDeactivationAndDeletion].path
          }
        >
          <AccountDeactivationAndDeletion />
        </Route>
      )}

      {displayScreentime && (
        <Route exact path={privacySettingCategoryPages[PrivacySettingName.Screentime].path}>
          <Screentime />
        </Route>
      )}

      {displayScreentime && (
        <Route path={screentimePages[PrivacySettingName.PerExperienceScreentime].path}>
          <TopGames />
        </Route>
      )}
    </div>
  );
};

export default PrivacySettingsContainer;
