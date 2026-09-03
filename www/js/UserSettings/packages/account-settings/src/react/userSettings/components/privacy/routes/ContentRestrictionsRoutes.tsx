import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingsList from "../../../../common/components/routing/SettingsList";
import { getTranslatedOptionValue } from "../../../constants/contentConstants/consentTranslationConstants";
import ContentMaturitySlider from "../ContentMaturitySlider";
import BlockedExperiences from "../BlockedExperiences";
import ApprovedExperiences from "../ApprovedExperiences";
import {
  contentRestrictionsPages,
  privacySettingCategoryPages,
} from "../../../constants/privacy/privacyConstants";
import SensitiveIssues from "../SensitiveIssues";

export const ContentRestrictionsRoutes = (): JSX.Element => {
  const { translate } = useTranslation();
  const [settingsAndOptions] = useGetSettingsAndOptions();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const displayAllowedExperiences = uiPolicy?.isAllowedExperiencesEnabled;
  const displaySensitiveIssues = settingsAndOptions?.[UserSetting.allowSensitiveIssues];

  // Fetch labels for current setting values
  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const result: Record<string, TSettingsPage> = {};

    (Object.keys(contentRestrictionsPages) as Array<keyof typeof contentRestrictionsPages>).forEach(
      key => {
        let currValueLabel: string | undefined;
        switch (key) {
          case PrivacySettingName.ContentMaturity:
            currValueLabel = getTranslatedOptionValue(
              settingsAndOptions?.[UserSetting.contentAgeRestriction]?.currentValue,
              translate,
            );
            break;
          case PrivacySettingName.SensitiveIssues:
            currValueLabel = getTranslatedOptionValue(
              settingsAndOptions?.[UserSetting.allowSensitiveIssues]?.currentValue,
              translate,
            );
            break;
          default:
        }
        result[key] = {
          ...contentRestrictionsPages[key],
          currentValueComponent: <span>{currValueLabel}</span>,
        };
      },
    );

    if (!displayAllowedExperiences) {
      delete result[PrivacySettingName.ApprovedExperiences];
    }

    if (!displaySensitiveIssues) {
      delete result[PrivacySettingName.SensitiveIssues];
    }

    return result;
  }, [settingsAndOptions, displayAllowedExperiences, displaySensitiveIssues]);

  return (
    <React.Fragment>
      <SettingsList
        subPages={pagesWithCurrentValues}
        routingPath={privacySettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}
      />
      <Route path={contentRestrictionsPages[PrivacySettingName.ContentMaturity].path}>
        <ContentMaturitySlider />
      </Route>
      <Route path={contentRestrictionsPages[PrivacySettingName.BlockedExperiences].path}>
        <BlockedExperiences />
      </Route>
      {displayAllowedExperiences && (
        <Route path={contentRestrictionsPages[PrivacySettingName.ApprovedExperiences].path}>
          <ApprovedExperiences />
        </Route>
      )}
      {displaySensitiveIssues && (
        <Route path={contentRestrictionsPages[PrivacySettingName.SensitiveIssues].path}>
          <SensitiveIssues />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ContentRestrictionsRoutes;
