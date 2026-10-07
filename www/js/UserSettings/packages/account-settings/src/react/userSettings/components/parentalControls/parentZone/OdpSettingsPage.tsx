import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { Loading } from "react-style-guide";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import useWrappedTranslation from "../../../hooks/useWrappedTranslation";

import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import ChildContentRestrictionsRoutes from "../routes/ChildContentRestrictionsRoutes";
import ChildCommunicationRoutes from "../routes/ChildCommunicationRoutes";
import ChildSpendingRestrictionRoutes from "../routes/ChildSpendingRestrictionRoutes";
import ChildVisibilityAndPrivateServersRoutes from "../routes/ChildVisibilityAndPrivateServersRoutes";
import FriendDiscovery from "../../privacy/FriendDiscovery";
import InventoryTradePrivacy from "../../privacy/InventoryTradePrivacy";

import { TOdpSettingsPage, getOdpSettingsSubpages } from "./odpSettingsPages";
import useManageOdpSetting from "./hooks/useManageOdpSetting";
import useOdpSettingsAndPages from "./hooks/useOdpSettingsAndPages";
import useOdpChildInfo from "./hooks/useOdpChildInfo";

export const OdpSettingsList = ({
  page,
  child,
  onUpdateSetting,
}: {
  page: TOdpSettingsPage;
  child: TChildSettingsInfo;
} & Required<TSettingUpdateProps>): React.JSX.Element => {
  const props = { child, onUpdateSetting };
  const idProps = { childUserId: child.userId, onUpdateSetting };
  const subpages = getOdpSettingsSubpages(page, child);
  switch (page.name) {
    case SettingCategoryPageName.ContentRestrictions:
      return (
        <ChildContentRestrictionsRoutes
          {...props}
          contentRestrictionsPage={page}
          subpages={subpages}
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
    case SettingCategoryPageName.TradingAndInventory:
      return <InventoryTradePrivacy {...idProps} showTradeQualityFilter={false} />;
    default:
      return <React.Fragment />;
  }
};

const OdpSettingsPage = ({ name }: { name: string }): React.JSX.Element => {
  const { pages, isLoading, isError, isFetching } = useOdpSettingsAndPages(name);
  const childQuery = useOdpChildInfo();
  const { manageSetting, isManaging, revision } = useManageOdpSetting();
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
    <fieldset disabled={isFetching || isManaging} className="stroke-none padding-none margin-none">
      <Switch>
        <Route
          exact
          path={[
            page.path,
            ...Object.values(getOdpSettingsSubpages(page, childQuery.child)).map(
              subpage => subpage.path,
            ),
          ]}
        >
          <OdpSettingsList
            key={revision}
            page={page}
            child={childQuery.child}
            onUpdateSetting={async request => {
              const setting = page.settings.find(candidate => candidate.name === request.setting);
              if (!isFetching && !isManaging && setting) {
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
