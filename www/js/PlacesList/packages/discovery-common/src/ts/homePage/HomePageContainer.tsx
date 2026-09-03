import React from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import ReminderOfNormsDialogContainer from "./reminderOfNorms";
import HomePage from "./HomePageOmniFeed";
import { CommonUIFeatures } from "../common/constants/translationConstants";

const HomePageContainer = ({ translate }: WithTranslationsProps): JSX.Element => {
  return (
    <div id="HomeContainer" className="row home-container expand-max-width">
      <div className="section">
        <div className="col-xs-12 container-header">
          <h1>{translate(CommonUIFeatures.LabelsHome)}</h1>
        </div>
      </div>
      <div>
        <ReminderOfNormsDialogContainer />
      </div>
      <div className="place-list-container">
        <SystemFeedbackProvider>
          {/* @ts-expect-error TODO: old, migrated code */}
          <HomePage />
        </SystemFeedbackProvider>
      </div>
    </div>
  );
};

export default withTranslations(HomePageContainer, {
  common: [],
  feature: "CommonUI.Features",
});
