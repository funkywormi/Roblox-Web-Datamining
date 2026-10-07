import React from "react";
import { useTranslation } from "react-utilities";
import { UserSetting } from "@rbx/user-settings";
import SettingsSection from "../../../common/components/SettingsSection";
import ToggleWithParentalConsent from "../../../common/components/ToggleWithParentalConsent";
import parentalControlsTranslationConstants from "../../constants/contentConstants/parentalControlsTranslationConstants";
import { TChildSettingsInfo } from "../../../../types/childrenInfoTypes";
import { TSettingUpdateProps } from "../../../../types/settingUpdateTypes";

export const SensitiveIssues = ({
  child,
  onUpdateSetting,
}: { child?: TChildSettingsInfo } & TSettingUpdateProps): JSX.Element => {
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
        onUpdateSetting={onUpdateSetting}
        label={translate(parentalControlsTranslationConstants.sensitiveIssues.allowSensitiveIssues)}
        settingName={UserSetting.allowSensitiveIssues}
        childUserId={child?.userId}
        inputId="allow-sensitive-issues-toggle"
      />
    </SettingsSection>
  );
};

export default SensitiveIssues;
