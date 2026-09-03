import { useTranslation } from "react-utilities";
import React from "react";
import { AccountSettingsLanguageSelector } from "Roblox";
import CollapsibleUserInput from "../../../common/components/CollapsibleUserInput";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";

const LanguageSetting = (): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <CollapsibleUserInput
      mobileLabel={translate(accountInfoTranslationConstants.headings.language)}
      desktopLabel={translate(accountInfoTranslationConstants.headings.language)}
      inputId="locale-list"
    >
      <AccountSettingsLanguageSelector translate={translate} />
    </CollapsibleUserInput>
  );
};

export default LanguageSetting;
