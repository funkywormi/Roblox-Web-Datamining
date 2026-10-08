import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import ToggleWithParentalConsent from "../../../../common/components/ToggleWithParentalConsent";
import ToggleWithParentalConsentV2 from "../../../../common/components/ToggleWithParentalConsentV2";
import SettingsSection from "../../../../common/components/SettingsSection";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import privacyTranslationConstants from "../../../constants/contentConstants/privacyTranslationConstants";
import { personaPageUrl, facialCapturePrivacyPageUrl } from "../../../constants/urlConstants";
import { TSettingUpdateProps } from "../../../../../types/settingUpdateTypes";

const AgeCheck = ({
  child,
  showFae,
  showIdv,
  onUpdateSetting,
}: {
  child: TChildSettingsInfo;
  showFae: boolean;
  showIdv: boolean;
} & TSettingUpdateProps): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SettingsSection
      description={translate(privacyTranslationConstants.facialAndIdVerificationBody)}
    >
      <React.Fragment>
        {showFae && (
          <ToggleWithParentalConsent
            onUpdateSetting={onUpdateSetting}
            label={translate(privacyTranslationConstants.allowFacialAgeEstimationLabel)}
            inputId="age-check-toggle"
            settingName={UserSetting.allowFacialAgeEstimation}
            childUserId={child?.userId}
            description={translate(
              privacyTranslationConstants.parentSideAllowFacialAgeEstimationDescription,
            )}
          />
        )}
        {showIdv && (
          <ToggleWithParentalConsentV2
            onUpdateSetting={onUpdateSetting}
            label={translate(privacyTranslationConstants.allowIdVerificationLabel)}
            inputId="allow-identity-verification-toggle"
            settingName={UserSetting.allowIdentityVerification}
            childUserId={child?.userId}
            description={translate(
              privacyTranslationConstants.parentSideAllowIdVerificationDescription,
            )}
          />
        )}
        {(showFae || showIdv) && (
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
        )}
      </React.Fragment>
    </SettingsSection>
  );
};

export default AgeCheck;
