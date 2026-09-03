import React from "react";
import { useTranslation } from "react-utilities";
import parentalControlsTranslationConstants from "../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";

/* 
  Used to denote whether a setting option is locked behind parental consent
*/
export const SettingOptionLockedPill = (): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div className="setting-option-pill xsmall ">
      <span className="icon-status-private themified-icon" />
      <span className="setting-option-label">
        {translate(parentalControlsTranslationConstants.parentLabel)}
      </span>
    </div>
  );
};

export default SettingOptionLockedPill;
