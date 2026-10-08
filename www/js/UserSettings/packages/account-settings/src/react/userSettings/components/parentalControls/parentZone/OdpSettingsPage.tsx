import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Loading } from "react-style-guide";
import { UserSetting } from "@rbx/user-settings";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import { TManageExperience } from "../../../../../types/parentConsentsTypes";
import { TSettingsUIPolicyBody } from "../../../../../types/policyTypes";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import useWrappedTranslation from "../../../hooks/useWrappedTranslation";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import ChildContentRestrictionsRoutes from "../routes/ChildContentRestrictionsRoutes";
import ChildCommunicationRoutes from "../routes/ChildCommunicationRoutes";
import ChildSpendingRestrictionRoutes from "../routes/ChildSpendingRestrictionRoutes";
import ChildVisibilityAndPrivateServersRoutes from "../routes/ChildVisibilityAndPrivateServersRoutes";
import FriendDiscovery from "../../privacy/FriendDiscovery";
import InventoryTradePrivacy from "../../privacy/InventoryTradePrivacy";
import AllowThirdPartyAppsSetting from "../../appPermissions/AllowThirdPartyAppsSetting";
import ChildNotificationSettings from "../parentDashboard/ChildNotificationSettings";
import AgeCheck from "../parentDashboard/AgeCheck";
import OdpBlockedUsers from "./OdpBlockedUsers";
import { TOdpSettingsPage, getOdpSettingsSubpages } from "./odpSettingsPages";
import useManageOdpSetting from "./hooks/useManageOdpSetting";
import useOdpSettingsAndPages from "./hooks/useOdpSettingsAndPages";
import useOdpChildInfo from "./hooks/useOdpChildInfo";
import useManageOdpExperience from "./hooks/useManageOdpExperience";

export const OdpSettingsList = ({
  page,
  child,
  onUpdateSetting,
  onManageExperience,
  policy,
}: {
  page: TOdpSettingsPage;
  child: TChildSettingsInfo;
  onManageExperience?: TManageExperience;
  policy?: TSettingsUIPolicyBody;
} & Required<TSettingUpdateProps>): React.JSX.Element => {
  const hasSetting = (...names: UserSetting[]) =>
    page.settings.some(setting => names.includes(setting.name));
  const props = { child, onUpdateSetting };
  const idProps = { childUserId: child.userId, onUpdateSetting };
  const subpages = getOdpSettingsSubpages(page, child, policy);
  switch (page.name) {
    case SettingCategoryPageName.ContentRestrictions:
      return (
        <ChildContentRestrictionsRoutes
          {...props}
          contentRestrictionsPage={page}
          subpages={subpages}
          onManageExperience={onManageExperience}
        />
      );
    case SettingCategoryPageName.Communication:
      return <ChildCommunicationRoutes {...props} communicationPage={page} subpages={subpages} />;
    case SettingCategoryPageName.Spending:
      return (
        <ChildSpendingRestrictionRoutes
          {...props}
          pages={{ childSettingCategoryPages: { [page.name]: page }, spendingPages: subpages }}
        />
      );
    case SettingCategoryPageName.VisibilityAndPrivateServers:
      return (
        <ChildVisibilityAndPrivateServersRoutes
          {...props}
          showThirdPartyFriendAccess={false}
          pages={{
            childSettingCategoryPages: { [page.name]: page },
            visibilityAndPrivateServersPages: subpages,
          }}
        />
      );
    case SettingCategoryPageName.FriendsAndContacts:
      return <FriendDiscovery {...props} />;
    case PrivacySettingName.BlockedUsers:
      return <OdpBlockedUsers />;
    case SettingCategoryPageName.TradingAndInventory:
      return <InventoryTradePrivacy {...idProps} showTradeQualityFilter={false} />;
    case SettingCategoryPageName.ThirdPartyApplications:
      return <AllowThirdPartyAppsSetting {...idProps} />;
    case SettingCategoryPageName.Notifications:
      return (
        <ChildNotificationSettings
          {...props}
          child={{
            ...child,
            canParentManageChildsDoNotDisturb: hasSetting(UserSetting.doNotDisturb),
          }}
        />
      );
    case SettingCategoryPageName.AgeCheck:
      return (
        <AgeCheck
          {...props}
          showFae={hasSetting(UserSetting.allowFacialAgeEstimation)}
          showIdv={hasSetting(UserSetting.allowIdentityVerification)}
        />
      );
    default:
      return <React.Fragment />;
  }
};

const OdpSettingsPage = ({ name }: { name: string }): React.JSX.Element => {
  const { pages, isLoading, isError, isFetching, policy } = useOdpSettingsAndPages(name);
  const childQuery = useOdpChildInfo();
  const { manageSetting, isManaging, revision } = useManageOdpSetting();
  const { manageExperience, isManaging: isManagingExperience } = useManageOdpExperience();
  const { translate } = useWrappedTranslation();
  if (isError || childQuery.isError) {
    return <div role="alert">{translate(commonTranslationConstants.unknownError)}</div>;
  }
  if (isLoading || childQuery.isLoading) {
    return <Loading />;
  }
  const page = pages[name];
  if (!page || !childQuery.child) {
    return <Redirect to={baseParentalControlsPath} />;
  }
  return (
    <fieldset
      disabled={isFetching || isManaging || isManagingExperience}
      className="stroke-none padding-none margin-none"
    >
      <Switch>
        <Route
          exact
          path={[
            page.path,
            ...Object.values(getOdpSettingsSubpages(page, childQuery.child, policy)).map(
              subpage => subpage.path,
            ),
          ]}
        >
          <OdpSettingsList
            key={revision}
            page={page}
            child={childQuery.child}
            policy={policy}
            onManageExperience={async (universeId, action) => {
              if (
                !isFetching &&
                !isManaging &&
                !isManagingExperience &&
                name === SettingCategoryPageName.ContentRestrictions &&
                childQuery.child?.canParentManageChildsExperiences === true
              ) {
                await manageExperience(universeId, action);
              }
            }}
            onUpdateSetting={async request => {
              const settingName =
                request.setting === UserSetting.doNotDisturbTimeWindow
                  ? UserSetting.doNotDisturb
                  : request.setting;
              const setting = page.settings.find(candidate => candidate.name === settingName);
              if (!isFetching && !isManaging && !isManagingExperience && setting) {
                await manageSetting(request);
              }
            }}
          />
        </Route>
        <Redirect to={page.path} />
      </Switch>
    </fieldset>
  );
};

export default OdpSettingsPage;
