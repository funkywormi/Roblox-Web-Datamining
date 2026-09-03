import { useTranslation } from "react-utilities";
import React from "react";
import { DeviceMeta } from "Roblox";
import SettingsSection from "../../../common/components/SettingsSection";
import PasswordSetting from "./PasswordSetting";
import PasskeySetting from "./PasskeySetting";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { isAndroidPasskeyEnabled } from "../../utils/authUtils";

export const LoginMethods = (): JSX.Element => {
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();

  const { translate } = useTranslation();
  return (
    <SettingsSection title={translate(accountInfoTranslationConstants.headings.loginMethods)}>
      <React.Fragment>
        {(!DeviceMeta().isInApp ||
          DeviceMeta().isIosApp ||
          (DeviceMeta().isAndroidApp && isAndroidPasskeyEnabled())) && <PasskeySetting />}
        {uiPolicy?.displayPasswordRow && accountInfo?.HasValidPasswordSet && <PasswordSetting />}
      </React.Fragment>
    </SettingsSection>
  );
};

export default LoginMethods;
