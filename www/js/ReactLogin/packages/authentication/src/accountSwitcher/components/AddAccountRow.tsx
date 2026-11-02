import React, { useState } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { accountSwitcherStrings } from "../constants/accountSwitcherConstants";

export type accountSelectionProps = {
  handleAddAccount: () => void;
};

export const AccountSelection = ({ handleAddAccount }: accountSelectionProps): JSX.Element => {
  const translate = useTranslations("Authentication.AccountSwitch");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  return (
    <div
      className="account-selection"
      role="button"
      tabIndex={0}
      onClick={() => {
        setIsSubmitting(true);
        handleAddAccount();
      }}
      onKeyDown={() => {
        setIsSubmitting(true);
        handleAddAccount();
      }}
    >
      <div className="account-switcher-icon-add">
        <span className="icon-plus" />
      </div>
      <div className="account-selection-name-container">
        <p className="account-selection-add-account">
          {translate(accountSwitcherStrings.ActionAddAccount)}
        </p>
      </div>
      {isSubmitting && <div className="spinner spinner-sm spinner-block" />}
    </div>
  );
};

export default AccountSelection;
