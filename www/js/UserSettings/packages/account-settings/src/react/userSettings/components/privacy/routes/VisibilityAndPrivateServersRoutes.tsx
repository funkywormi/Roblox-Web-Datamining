import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import {
  privacySettingCategoryPages,
  visibilityAndPrivateServersPages,
} from "../../../constants/privacy/privacyConstants";
import SettingsList from "../../../../common/components/routing/SettingsList";
import VisibilitySettings from "../VisibilitySettings";
import PrivateServerPrivacy from "../PrivateServerPrivacy";
import { getTranslatedOptionValue } from "../../../constants/contentConstants/consentTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

export const VisibilityAndPrivateServersRoutes = (): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const [userSettings] = useGetSettingsAndOptions();

  // Fetch labels for current setting values
  const visibilityAndPrivateServersPagesWithCurrentValues: Record<string, TSettingsPage> =
    useMemo(() => {
      const result: Record<string, TSettingsPage> = {};

      (
        Object.keys(visibilityAndPrivateServersPages) as Array<
          keyof typeof visibilityAndPrivateServersPages
        >
      ).forEach(key => {
        let optionTranslation: string | undefined;
        switch (key) {
          case PrivacySettingName.PrivateServerPrivacy:
            optionTranslation = getTranslatedOptionValue(
              userSettings?.[UserSetting.privateServerPrivacy]?.currentValue,
              translate,
            );
            break;
          default:
        }
        result[key] = {
          ...visibilityAndPrivateServersPages[key],
          currentValueComponent: <span>{optionTranslation}</span>,
        };
      });
      return result;
    }, [userSettings]);

  return (
    <React.Fragment>
      <SettingsList
        subPages={visibilityAndPrivateServersPagesWithCurrentValues}
        routingPath={
          privacySettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers].path
        }
      />
      <Route path={visibilityAndPrivateServersPages[SettingCategoryPageName.Visibility].path}>
        <VisibilitySettings />
      </Route>
      <Route path={visibilityAndPrivateServersPages[PrivacySettingName.PrivateServerPrivacy].path}>
        <PrivateServerPrivacy />
      </Route>
    </React.Fragment>
  );
};

export default VisibilityAndPrivateServersRoutes;
