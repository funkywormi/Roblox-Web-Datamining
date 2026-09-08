import React from "react";
import { useTranslation } from "react-utilities";
import { ProgressCircle } from "@rbx/foundation-ui";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import ContentMaturitySlider from "./ContentMaturitySlider";
import IarcAgeRatingPage from "./IarcAgeRatingPage";

export const ContentMaturity = (): JSX.Element => {
  const { translate } = useTranslation();
  const { data: uiPolicy, isLoading } = useGetSettingsUiPolicyQuery();

  if (isLoading) {
    return (
      <div className="flex width-full justify-center padding-y-large">
        <ProgressCircle
          ariaLabel={translate(commonTranslationConstants.loading)}
          size="Medium"
          variant="Indeterminate"
        />
      </div>
    );
  }

  if (uiPolicy?.isIarcAgeRatingEnabled) {
    return <IarcAgeRatingPage />;
  }

  return <ContentMaturitySlider />;
};

export default ContentMaturity;
