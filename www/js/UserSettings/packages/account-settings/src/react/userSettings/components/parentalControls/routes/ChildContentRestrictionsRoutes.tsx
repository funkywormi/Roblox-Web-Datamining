import React, { useMemo } from "react";
import { Route } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import useGetSettingsAndOptionsV2 from "../../../../apis/hooks/useGetSettingsAndOptionsV2";
import { useGetSettingsUiPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingsList from "../../../../common/components/routing/SettingsList";
import { getTranslatedOptionValue } from "../../../constants/contentConstants/consentTranslationConstants";
import ContentMaturitySlider from "../../privacy/ContentMaturitySlider";
import BlockedExperiences from "../../privacy/BlockedExperiences";
import BlockedExperiencesSearch from "../../privacy/BlockedExperiencesSearch";
import ApprovedExperiences from "../../privacy/ApprovedExperiences";
import SensitiveIssues from "../../privacy/SensitiveIssues";
import PrivatePlaytestPrivacy from "../../privacy/PrivatePlaytestPrivacy";

export const ChildContentRestrictionsRoutes = ({
  child,
  contentRestrictionsPage,
  subpages,
}: {
  child: TChildInfo;
  contentRestrictionsPage: TSettingsPage;
  subpages: Record<string, TSettingsPage>;
}): JSX.Element => {
  const displayContentMaturity = child.canParentAccessChildBasicPrivacySettings;
  const { translate } = useTranslation();
  const [childSettings] = useGetSettingsAndOptions(child.userId);
  const [childSettingsV2] = useGetSettingsAndOptionsV2(child.userId);
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const displayAllowedExperiences = uiPolicy?.isAllowedExperiencesEnabled;
  const displaySensitiveIssues = childSettings?.[UserSetting.allowSensitiveIssues];
  const displayPrivatePlaytest =
    child.canParentManageChildsPrivatePlaytestSetting &&
    childSettingsV2?.[UserSetting.privatePlaytest];

  // Fetch labels for current setting values
  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const result: Record<string, TSettingsPage> = {};

    Object.keys(subpages).forEach(key => {
      let currValueLabel: string | undefined;
      switch (key) {
        case PrivacySettingName.ContentMaturity:
          currValueLabel = getTranslatedOptionValue(
            childSettings?.[UserSetting.contentAgeRestriction]?.currentValue,
            translate,
          );
          break;
        case PrivacySettingName.SensitiveIssues:
          currValueLabel = getTranslatedOptionValue(
            childSettings?.[UserSetting.allowSensitiveIssues]?.currentValue,
            translate,
          );
          break;
        case PrivacySettingName.PrivatePlaytest:
          currValueLabel = getTranslatedOptionValue(
            childSettingsV2?.[UserSetting.privatePlaytest]?.currentValue,
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

    delete result[PrivacySettingName.BlockedExperiencesSearch]; // Search page should not show up in settings menu list, only when parent clicks the search button

    if (!displayAllowedExperiences) {
      delete result[PrivacySettingName.ApprovedExperiences];
    }

    if (!displaySensitiveIssues) {
      delete result[PrivacySettingName.SensitiveIssues];
    }

    if (!displayContentMaturity) {
      delete result[PrivacySettingName.ContentMaturity];
    }

    if (!displayPrivatePlaytest) {
      delete result[PrivacySettingName.PrivatePlaytest];
    }

    return result;
  }, [
    childSettings,
    childSettingsV2,
    subpages,
    displayAllowedExperiences,
    displaySensitiveIssues,
    displayContentMaturity,
    displayPrivatePlaytest,
  ]);

  return (
    <React.Fragment>
      <SettingsList subPages={pagesWithCurrentValues} routingPath={contentRestrictionsPage.path} />
      {displayContentMaturity && (
        <Route path={subpages[PrivacySettingName.ContentMaturity]?.path}>
          <ContentMaturitySlider childUserId={child.userId} />
        </Route>
      )}
      <Route exact path={subpages[PrivacySettingName.BlockedExperiences]?.path}>
        <BlockedExperiences
          child={child}
          searchPagePath={subpages[PrivacySettingName.BlockedExperiencesSearch]?.path}
        />
      </Route>
      <Route path={subpages[PrivacySettingName.BlockedExperiencesSearch]?.path}>
        <BlockedExperiencesSearch child={child} />
      </Route>
      {displayAllowedExperiences && (
        <Route path={subpages[PrivacySettingName.ApprovedExperiences]?.path}>
          <ApprovedExperiences child={child} />
        </Route>
      )}
      {displaySensitiveIssues && (
        <Route path={subpages[PrivacySettingName.SensitiveIssues]?.path}>
          <SensitiveIssues child={child} />
        </Route>
      )}
      {displayPrivatePlaytest && (
        <Route path={subpages[PrivacySettingName.PrivatePlaytest]?.path}>
          <PrivatePlaytestPrivacy child={child} />
        </Route>
      )}
    </React.Fragment>
  );
};

export default ChildContentRestrictionsRoutes;
