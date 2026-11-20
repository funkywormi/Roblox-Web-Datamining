import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
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
import {
  hasAnySetting,
  visibilityPageSettings,
} from "../../../utils/parentalControls/childSettingsMenuUtils";

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
  const [childSettingsV2] = useGetSettingsAndOptionsV2(child.userId);

  const subpages = childPages?.visibilityAndPrivateServersPages || {};
  const displayVisibility = hasAnySetting(visibilityPageSettings, childSettings, childSettingsV2);
  const displayPrivateServerPrivacy = childSettings?.[UserSetting.privateServerPrivacy];

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

    if (!displayVisibility) {
      delete result[SettingCategoryPageName.Visibility];
    }

    if (!displayPrivateServerPrivacy) {
      delete result[PrivacySettingName.PrivateServerPrivacy];
    }

    return result;
  }, [childSettings, subpages, displayVisibility, displayPrivateServerPrivacy]);

  return (
    <React.Fragment>
      <SettingsList
        subPages={pagesWithCurrentValues}
        routingPath={visibilityAndPrivateServersPage?.path}
      />
      {displayVisibility && subpages[SettingCategoryPageName.Visibility] && (
        <Route path={subpages[SettingCategoryPageName.Visibility]?.path}>
          <VisibilitySettings
            child={child}
            onUpdateSetting={onUpdateSetting}
            showThirdPartyFriendAccess={showThirdPartyFriendAccess}
          />
        </Route>
      )}
      {displayPrivateServerPrivacy && subpages[PrivacySettingName.PrivateServerPrivacy] && (
        <Route path={subpages[PrivacySettingName.PrivateServerPrivacy]?.path}>
          <PrivateServerPrivacy child={child} onUpdateSetting={onUpdateSetting} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildVisibilityAndPrivateServersRoutes;
