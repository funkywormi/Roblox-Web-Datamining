import React from "react";
import { useTranslation } from "react-utilities";
import { Access } from "../../../../../types/accessManagementTypes";
import SettingsSection from "../../../../common/components/SettingsSection";
import AMPFeaturesConstants from "../../../constants/AMPFeaturesConstants";
import { useGetFeatureAccessQuery } from "../../../../apis/accessManagementApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const ScreentimeDescription = (): JSX.Element | null => {
  const { translate } = useTranslation();

  const { data: featureAccessData, isLoading: isFeatureAccessLoading } = useGetFeatureAccessQuery({
    featureName: AMPFeaturesConstants.DoesParentManageScreentime,
  });

  const isFeatureGranted = featureAccessData?.access === Access.Granted;

  const descriptionKey =
    parentalControlsTranslationConstants.screentimeManagement.childSideDescriptionWithoutLimit;

  if (isFeatureAccessLoading || !isFeatureGranted) {
    return null;
  }

  return (
    <SettingsSection description={<React.Fragment>{translate(descriptionKey)}</React.Fragment>} />
  );
};

export default ScreentimeDescription;
