import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import SettingsSection from "../../../common/components/SettingsSection";
import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import { TChildInfo } from "../../../../types/childrenInfoTypes";

export const SensitiveIssues = ({ child }: { child?: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();

  return (
    <SettingsSection
      description={
        child?.userId
          ? translate(parentalControlsTranslationConstants.sensitiveIssues.parentSideDescription)
          : translate(parentalControlsTranslationConstants.sensitiveIssues.childSideDescription)
      }
    >
      <ToggleWithParentalConsent
        label={translate(parentalControlsTranslationConstants.sensitiveIssues.allowSensitiveIssues)}
        settingName={UserSetting.allowSensitiveIssues}
        childUserId={child?.userId}
        inputId="allow-sensitive-issues-toggle"
      />
    </SettingsSection>
  );
};

export default SensitiveIssues;
