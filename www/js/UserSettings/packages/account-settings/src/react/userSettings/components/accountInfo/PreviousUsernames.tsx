import { useTranslation } from "react-utilities";
import React from "react";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";

export const PreviousUsernames = (): JSX.Element => {
  const { data: accountInfo, isLoading } = useGetAccountInfoQuery();
  const { translate } = useTranslation();

  return (
    <React.Fragment>
      {!isLoading && accountInfo?.PreviousUserNames && (
        <div className="form-group settings-text-field-container">
          <span className="account-previous-usernames text-body-medium">
            {translate(accountInfoTranslationConstants.previousUsernames.label)}
            <span className="account-previous-username-list text-body-medium">
              {accountInfo?.PreviousUserNames}
            </span>
          </span>
        </div>
      )}
    </React.Fragment>
  );
};

export default PreviousUsernames;
