import { Button } from "react-style-guide";
import React from "react";
import { useTranslation } from "react-utilities";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { parentDashboardHelpPageUrl } from "../../../constants/urlConstants";

export const ParentDashboardWelcomeScreen = (): JSX.Element => {
  const { translate } = useTranslation();
  const { parentWelcome } = parentalControlsTranslationConstants;
  return (
    <div className="parental-controls-welcome">
      <h3 className="welcome-header font-header-2">{translate(parentWelcome.heading)}</h3>
      <p
        dangerouslySetInnerHTML={{
          __html: translate(parentWelcome.description, {
            lineBreak: "<br><br>",
          }),
        }}
      />
      <div className="welcome-btn-wrapper">
        <a target="_blank" rel="noreferrer" href={parentDashboardHelpPageUrl}>
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

export default ParentDashboardWelcomeScreen;
