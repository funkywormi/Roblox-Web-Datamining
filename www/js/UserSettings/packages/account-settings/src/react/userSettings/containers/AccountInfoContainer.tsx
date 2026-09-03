import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import { useSnackbar } from "@rbx/user-settings";
import { ApiRequestStatus } from "../../../types/accountInformationTypes";
import SocialNetworksSettings from "../components/accountInfo/SocialNetworkSettings";
import commonTranslationConstants from "../constants/contentConstants/commonTranslationConstants";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import { PersonalSettings } from "../components/accountInfo/PersonalSettings";
import AccountInfo from "../components/accountInfo/AccountInfo";
import { useGetAccountInfoQuery } from "../../apis/legacyAccountSettingsApi";
import { useGetAuthMetadataQuery } from "../../apis/authApi";
import LoginMethods from "../components/accountInfo/LoginMethods";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import BetaProgramsSettings from "../components/accountInfo/BetaProgramsSettings";
import { useGetBetaProgramsQuery } from "../../apis/testPilotApi";

export const AccountInfoContainer = (): JSX.Element => {
  const { data: accountInfo, status: accountInfoStatus } = useGetAccountInfoQuery();
  const { data: uiPolicy, status: policyStatus } = useGetSettingsUiPolicyQuery();
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const { data: authMetadata } = useGetAuthMetadataQuery();
  const { data: betaPrograms, isLoading: programsLoading } = useGetBetaProgramsQuery();

  useEffect(() => {
    if (ApiRequestStatus.error in [accountInfoStatus, policyStatus]) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountInfoStatus, policyStatus]);

  return (
    <div className="settings-container-v2">
      <div className="settings-v2-header" id="rbx-account-info-settings-header">
        <h2>{translate(navigationTranslationConstants.accountInfoHeading)}</h2>
      </div>
      <AccountInfo />
      {authMetadata?.IsPasskeyFeatureEnabled && <LoginMethods />}
      <PersonalSettings />
      {!accountInfo?.UseSuperSafePrivacyMode &&
        uiPolicy?.displaySocialMedia &&
        !uiPolicy?.hideSocialLinksSection && <SocialNetworksSettings />}
      {!programsLoading && betaPrograms && betaPrograms.length > 0 && (
        <BetaProgramsSettings betaPrograms={betaPrograms} />
      )}
    </div>
  );
};

export default AccountInfoContainer;
