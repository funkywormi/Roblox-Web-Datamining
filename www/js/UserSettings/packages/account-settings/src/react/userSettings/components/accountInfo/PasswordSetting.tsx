import React, { useEffect } from "react";
import { useTranslation } from "react-utilities";
import SettingsTextField from "../../../common/components/SettingsTextField";
import useSetPasswordModal from "../../../common/hooks/modals/useSetPasswordModal";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import { passwordPlaceholder } from "../../constants/passwordConstants";
import { shouldDisplayInitialModal, initialModalQueryparam } from "../../utils/hybridViewUtils";

export const PasswordSetting = (): JSX.Element => {
  const { translate } = useTranslation();

  const [setPasswordModals, setPasswordModalService] = useSetPasswordModal();

  // Check for changepassword query to open change password modal automatically
  useEffect(() => {
    const displayChangePasswordModal = shouldDisplayInitialModal(
      initialModalQueryparam.changePassword,
    );
    if (displayChangePasswordModal) {
      setPasswordModalService.open();
    }
  }, [setPasswordModalService]);

  return (
    <React.Fragment>
      {setPasswordModals}
      <SettingsTextField
        primaryEditLabel={translate(
          accountInfoTranslationConstants.changePassword.changePasswordHeading,
        )}
        label={translate(accountInfoTranslationConstants.changePassword.passwordLabel)}
        valueSet
        lines={[{ value: passwordPlaceholder }]}
        primaryOnEdit={setPasswordModalService.open}
        primaryActionId="account-change-password"
      />
    </React.Fragment>
  );
};

export default PasswordSetting;
