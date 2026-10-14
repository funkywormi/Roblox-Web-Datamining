import { useTranslation } from "react-utilities";
import React, { useCallback, useEffect, useState } from "react";
import { cryptoUtil } from "core-roblox-utilities";
import { TextInput } from "@rbx/foundation-ui";
import {
  ChallengeAbandonedError,
  useSettingsModal,
  useSettingsInfoModal,
  IModalService,
} from "@rbx/user-settings";
import usePasswordPolicyMsgShownEvent from "@rbx/authentication-common/hooks/usePasswordPolicyMsgShownEvent";
import { TUpdatePasswordBody } from "../../../../types/accountInformationTypes";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import { useChangePasswordMutation } from "../../../apis/authApi";
import accountInfoEventService from "../../../userSettings/services/eventServices/accountInfoEventService";

const { generateSecureAuthIntentV2 } = cryptoUtil;

const useSetPasswordModal = (): [React.JSX.Element, IModalService] => {
  const { translate } = useTranslation();
  const [changePassword] = useChangePasswordMutation();

  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [errorMessageKey, setErrorMessageKey] = useState<string>();
  const errorMessage = errorMessageKey ? translate(errorMessageKey) : errorMessageKey;
  usePasswordPolicyMsgShownEvent(errorMessageKey, accountInfoEventService.passwordPolicyMsgShown);

  const actionDisabled =
    !oldPassword || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword;

  const [passwordChangedModal, passwordChangedModalService] = useSettingsInfoModal(
    translate(accountInfoTranslationConstants.changePassword.passwordChangedSuccessHeading),
    translate(accountInfoTranslationConstants.changePassword.changePasswordConfirmationDescription),
    translate(commonTranslationConstants.modal.submitButtonText),
    translate(commonTranslationConstants.modal.closeBtn),
    "Small",
  );

  const cleanUpState = useCallback(() => {
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorMessageKey("");
  }, []);

  const actionHandler = async (): Promise<void> => {
    try {
      const secureAuthenticationIntent = await generateSecureAuthIntentV2();
      const updatebody: TUpdatePasswordBody = {
        currentPassword: oldPassword,
        newPassword,
        secureAuthenticationIntent,
      };
      await changePassword(updatebody).unwrap();
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      setPasswordModalService.close();
      passwordChangedModalService.open();
    } catch (error) {
      // Ignore challenge abandons for errors.
      if (error !== ChallengeAbandonedError) {
        setErrorMessageKey(error as string);
      }
      return;
    }
    cleanUpState();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!actionDisabled) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        actionHandler();
      }
    }
  };

  useEffect(() => {
    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setErrorMessageKey(accountInfoTranslationConstants.changePassword.changePasswordNoMatch);
    }
  }, [newPassword, confirmNewPassword]);

  const body = (
    <div className="flex flex-col gap-medium">
      <TextInput
        type="password"
        value={oldPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setErrorMessageKey("");
          setOldPassword(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={translate(
          accountInfoTranslationConstants.changePassword.changePasswordCurrentPlaceholder,
        )}
        size="Medium"
      />
      <TextInput
        type="password"
        value={newPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setErrorMessageKey("");
          setNewPassword(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={translate(
          accountInfoTranslationConstants.changePassword.changePasswordNewPlaceholder,
        )}
        size="Medium"
      />
      <TextInput
        type="password"
        value={confirmNewPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setErrorMessageKey("");
          setConfirmNewPassword(event.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder={translate(
          accountInfoTranslationConstants.changePassword.changePasswordConfirmPlaceholder,
        )}
        size="Medium"
        hasError={!!errorMessage}
        error={errorMessage}
      />
    </div>
  );

  const [setPasswordModal, setPasswordModalService] = useSettingsModal({
    translatedTitle: translate(
      accountInfoTranslationConstants.changePassword.changePasswordHeading,
    ),
    translatedBody: body,
    translatedActionButtonText: translate(
      accountInfoTranslationConstants.changePassword.changePasswordAction,
    ),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: actionHandler,
    onDismiss: cleanUpState,
    disableActionButton: actionDisabled,
    shouldCloseModalOnActionButton: false,
  });

  const modals = (
    <React.Fragment>
      {setPasswordModal}
      {passwordChangedModal}
    </React.Fragment>
  );

  return [modals, setPasswordModalService];
};

export default useSetPasswordModal;
