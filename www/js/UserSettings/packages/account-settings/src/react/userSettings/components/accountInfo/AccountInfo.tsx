import React from "react";
import { Loading } from "react-style-guide";
import SettingsSection from "../../../common/components/SettingsSection";
import Username from "./Username";
import PasswordSetting from "./PasswordSetting";
import EmailSetting from "./EmailSetting";
import PhoneNumberSetting from "./PhoneSetting";
import PreviousUsernames from "./PreviousUsernames";
import DisplayName from "./DisplayName";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetAuthMetadataQuery } from "../../../apis/authApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

export const AccountInfo = (): JSX.Element => {
  const { data: accountInfo, isLoading } = useGetAccountInfoQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: authMetadata, isLoading: isLoadingAuthMetadata } = useGetAuthMetadataQuery();

  /* If passkeys feature is enabled, the password setting goes under the Login Methods section. */
  const displayPasswordRowInAccountInfo =
    !isLoadingAuthMetadata &&
    uiPolicy?.displayPasswordRow &&
    accountInfo?.HasValidPasswordSet &&
    !authMetadata?.IsPasskeyFeatureEnabled;

  return (
    <SettingsSection id="rbx-account-info-header">
      {isLoading ? (
        <Loading />
      ) : (
        <React.Fragment>
          {accountInfo?.IsDisplayNamesEnabled && <DisplayName />}
          <Username />
          {displayPasswordRowInAccountInfo && <PasswordSetting />}
          <PreviousUsernames />
          {uiPolicy?.displayPhoneNumber && <PhoneNumberSetting />}
          {uiPolicy?.displayEmailAddress && <EmailSetting />}
        </React.Fragment>
      )}
    </SettingsSection>
  );
};

export default AccountInfo;
