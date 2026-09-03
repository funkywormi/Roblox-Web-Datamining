import React from "react";
import { useTranslation } from "react-utilities";
import { Badge } from "@rbx/foundation-ui";
import SettingsTextField, {
  type SettingsTextFieldLine,
} from "../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import useVerifyEmailModal from "../../../common/hooks/modals/useVerifyEmailModal";
import eventService from "../../services/eventServices/eventService";
import { eventConstants } from "../../constants/eventConstants";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetSettingsMetadataQuery } from "../../../apis/userSettingsApi";
import { useGetEmailsQuery } from "../../../apis/accountSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import useSetEmailModal from "../../../common/hooks/modals/useSetEmailModal";

const useSelectEmailSettingProps = (): {
  isLoading: boolean;
  userOver13: boolean;
  verifiedEmail: string;
  pendingEmail: string;
  isEmailOnFile: boolean;
  hideEmailAddressChangeField: boolean;
} => {
  const { data: accountInfo, isLoading: accountInfoIsLoading } = useGetAccountInfoQuery();
  const { data: emails, isLoading: emailsIsLoading } = useGetEmailsQuery();
  const { data: settingsMetadata } = useGetSettingsMetadataQuery();
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();

  return {
    isLoading: accountInfoIsLoading || emailsIsLoading,
    userOver13: Boolean(accountInfo?.UserAbove13),
    verifiedEmail: emails?.verifiedEmail ?? "",
    pendingEmail: emails?.pendingEmail ?? "",
    isEmailOnFile: Boolean(emails?.verifiedEmail || emails?.pendingEmail),
    hideEmailAddressChangeField:
      Boolean(settingsMetadata?.hideEmailAddressChangeField) &&
      !settingsUiPolicy?.parentEmailChangesEnabled,
  };
};

export const EmailSetting = (): JSX.Element => {
  const {
    isLoading,
    userOver13,
    verifiedEmail,
    pendingEmail,
    isEmailOnFile,
    hideEmailAddressChangeField,
  } = useSelectEmailSettingProps();

  const { translate } = useTranslation();

  const { email } = accountInfoTranslationConstants;

  const [verifyEmailModal, verifyEmailModalService] = useVerifyEmailModal();
  const [setEmailModalV2, setEmailModalServiceV2] = useSetEmailModal();

  const editEmailHandler = () => {
    if (isEmailOnFile) {
      eventService.btnClicked(eventConstants.changeEmailBtn);
    } else {
      eventService.btnClicked(eventConstants.addEmailBtn);
    }

    setEmailModalServiceV2.open();
  };

  const verifyEmailHandler = () => {
    verifyEmailModalService.open();
  };

  const unverifiedEmailMetadata = (
    <div className="inline-badge">
      <Badge
        variant="Neutral"
        icon="icon-regular-clock"
        label={translate(email.verificationPendingLabel)}
      />
    </div>
  );

  const verifiedEmailMetadata = (
    <div className="inline-badge">
      <Badge
        variant="Neutral"
        icon="icon-filled-circle-check"
        label={translate(email.verifiedLabel)}
      />
    </div>
  );

  const noneMetadata = (
    <span className="text-body-medium">
      {translate(accountInfoTranslationConstants.email.noneLabel)}
    </span>
  );

  const getPrimaryEditLabel = (): string => {
    if (!isEmailOnFile) {
      return translate(email.addLabel);
    }
    if (!pendingEmail) {
      return translate(email.updateLabel);
    }
    return translate(email.verifyLabel);
  };

  const lines: SettingsTextFieldLine[] = [];

  // Add verified email if it exists
  if (verifiedEmail) {
    lines.push({
      value: verifiedEmail,
      metadataBody: verifiedEmailMetadata,
    });
  }

  // Add pending email if it exists
  if (pendingEmail) {
    lines.push({
      value: pendingEmail,
      metadataBody: unverifiedEmailMetadata,
    });
  }

  // If no emails, show "None"
  if (lines.length === 0) {
    lines.push({
      value: "",
      metadataBody: noneMetadata,
    });
  }

  return (
    <React.Fragment>
      {!isLoading && (
        <SettingsTextField
          label={translate(userOver13 ? email.label : email.parent.parentalRecoveryEmailLabel)}
          valueSet={Boolean(verifiedEmail && !pendingEmail)}
          lines={lines}
          primaryEditLabel={getPrimaryEditLabel()}
          primaryOnEdit={pendingEmail ? verifyEmailHandler : editEmailHandler}
          secondaryEditLabel={pendingEmail ? translate(email.updateLabel) : ""}
          secondaryOnEdit={editEmailHandler}
          displayEditButton={!hideEmailAddressChangeField}
        />
      )}
      {verifyEmailModal}
      {setEmailModalV2}
    </React.Fragment>
  );
};

export default EmailSetting;
