import { Button } from "react-style-guide";
import React from "react";
import { useTranslation } from "react-utilities";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { childDashboardHelpPageUrl } from "../../../constants/urlConstants";

// Informational screen for children who are ineligible to initiate a parent link
export const ChildWelcomeWithoutParentLinking = (): JSX.Element => {
  const { translate } = useTranslation();

  const { teenWelcome } = parentalControlsTranslationConstants;

  return (
    <div className="parental-controls-welcome">
      <h3 className="welcome-header font-header-2">{translate(teenWelcome.heading)}</h3>
      <p>{translate(teenWelcome.description)}</p>
      <div className="welcome-btn-wrapper">
        <a target="_blank" rel="noreferrer" href={childDashboardHelpPageUrl}>
          <Button
            variant={Button.variants.secondary}
            onClick={() => {
              // the onclick functionality comes from the <a> link
            }}
          >
            {translate(commonTranslationConstants.learnMore)}
          </Button>
        </a>
      </div>
    </div>
  );
};

export default ChildWelcomeWithoutParentLinking;
