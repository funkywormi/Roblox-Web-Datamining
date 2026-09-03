import { useTranslation } from "react-utilities";
import React from "react";
import commonTranslationConstants from "../../userSettings/constants/contentConstants/commonTranslationConstants";

/* 
  Used to denote whether a setting option has a pending request for parental consent
*/
export const SettingOptionPendingPill = (): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <div className="setting-option-pill xsmall ">
      <span className="icon-uiblox-pending themified-icon" />
      <span className="setting-option-label">{translate(commonTranslationConstants.pending)}</span>
    </div>
  );
};

export default SettingOptionPendingPill;
