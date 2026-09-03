import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import ToggleWithParentalConsent from "../../../../common/components/ToggleWithParentalConsent";
import SettingsSection from "../../../../common/components/SettingsSection";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { personaPageUrl, facialCapturePrivacyPageUrl } from "../../../constants/urlConstants";

const AgeCheck = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SettingsSection
      description={translate(parentalControlsTranslationConstants.ageCheck.description)}
    >
      <React.Fragment>
        <ToggleWithParentalConsent
          label={translate(parentalControlsTranslationConstants.ageCheck.label)}
          inputId="age-check-toggle"
          settingName={UserSetting.allowFacialAgeEstimation}
          childUserId={child?.userId}
          description={translate(parentalControlsTranslationConstants.ageCheck.toggleDescription)}
        />
        <div
          className="small text experience-chat-disclaimer"
          dangerouslySetInnerHTML={{
            __html: translate(parentalControlsTranslationConstants.ageCheck.disclaimer, {
              facialCapturePrivacyLinkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${facialCapturePrivacyPageUrl}>`,
              facialCapturePrivacyLinkEnd: `</a>`,
              personaLinkStart: `<a class="text-link" target="_blank" rel="noreferrer" href=${personaPageUrl}>`,
              personaLinkEnd: `</a>`,
            }),
          }}
        />
      </React.Fragment>
    </SettingsSection>
  );
};

export default AgeCheck;
