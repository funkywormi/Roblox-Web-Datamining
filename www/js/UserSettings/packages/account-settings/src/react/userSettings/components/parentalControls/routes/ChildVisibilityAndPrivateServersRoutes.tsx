import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import SettingsList from "../../../../common/components/routing/SettingsList";
import VisibilitySettings from "../../privacy/VisibilitySettings";
import {
  selectChildPagesForChildUserId,
  TChildPages,
} from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import PrivateServerPrivacy from "../../privacy/PrivateServerPrivacy";
import { getTranslatedOptionValue } from "../../../constants/contentConstants/consentTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const ChildVisibilityAndPrivateServersRoutes = ({
  child,
  pages,
  onUpdateSetting,
  showThirdPartyFriendAccess,
}: {
  child: TChildSettingsInfo;
  pages?: Pick<TChildPages, "childSettingCategoryPages" | "visibilityAndPrivateServersPages">;
  showThirdPartyFriendAccess?: boolean;
} & TSettingUpdateProps): JSX.Element => {
  const { translate } = useWrappedTranslation();

  const linkedChildPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const childPages = pages ?? linkedChildPages;
  const visibilityAndPrivateServersPage =
    childPages?.childSettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers];

  const [childSettings] = useGetSettingsAndOptions(child.userId);

  const subpages = childPages?.visibilityAndPrivateServersPages || {};

  // Fetch labels for current setting values
  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const result: Record<string, TSettingsPage> = {};

    Object.keys(subpages).forEach(key => {
      let currValueLabel: string | undefined;
      switch (key) {
        case PrivacySettingName.PrivateServerPrivacy:
          currValueLabel = getTranslatedOptionValue(
            childSettings?.[UserSetting.privateServerPrivacy]?.currentValue,
            translate,
          );
          break;
        default:
      }
      result[key] = {
        ...subpages[key]!,
        currentValueComponent: <span>{currValueLabel}</span>,
      };
    });
    return result;
  }, [childSettings, subpages]);

  return (
    <React.Fragment>
      <SettingsList
        subPages={pagesWithCurrentValues}
        routingPath={visibilityAndPrivateServersPage?.path}
      />
      {subpages[SettingCategoryPageName.Visibility] && (
        <Route path={subpages[SettingCategoryPageName.Visibility]?.path}>
          <VisibilitySettings
            child={child}
            onUpdateSetting={onUpdateSetting}
            showThirdPartyFriendAccess={showThirdPartyFriendAccess}
          />
        </Route>
      )}
      {subpages[PrivacySettingName.PrivateServerPrivacy] && (
        <Route path={subpages[PrivacySettingName.PrivateServerPrivacy]?.path}>
          <PrivateServerPrivacy child={child} onUpdateSetting={onUpdateSetting} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildVisibilityAndPrivateServersRoutes;
