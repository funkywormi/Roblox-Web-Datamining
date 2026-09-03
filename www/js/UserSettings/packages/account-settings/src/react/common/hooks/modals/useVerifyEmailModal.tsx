import React, { useState } from "react";
import { useTranslation } from "react-utilities";
import {
  useSettingsModal as useSettingsModalFromPackage,
  useSettingsInfoModal as useSettingsInfoModalFromPackage,
  IModalService,
} from "@rbx/user-settings";
import useSettingsModal, { useSettingsInfoModal } from "./useSettingsModal";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import emailTranslationConstants from "../../../userSettings/constants/contentConstants/emailTranslationConstants";
import { useSendVerificationEmailMutation } from "../../../apis/emailApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";

const useVerifyEmailModal = (
  verifiedEmailRequired = false,
  contextForVerification = "",
): [JSX.Element, IModalService] => {
  const { translate } = useTranslation();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const [verifyEmailError, setVerifyEmailError] = useState(commonTranslationConstants.unknownError);
  const [sendVerificationEmailMutation] = useSendVerificationEmailMutation();

  const enableFoundationModals = uiPolicy?.enableFoundationModals ?? false;

  // V1 modals
  const [emailVerificationSentModalV1, emailVerificationSentModalServiceV1] = useSettingsInfoModal(
    emailTranslationConstants.verifyEmailHeading,
    emailTranslationConstants.emailVerificationSentDialog,
    "sm",
  );

  const [errorModalV1, errorModalServiceV1] = useSettingsInfoModal(
    emailTranslationConstants.verifyEmailHeading,
    verifyEmailError,
    "sm",
  );

  // V2 modals
  const [emailVerificationSentModalV2, emailVerificationSentModalServiceV2] =
    useSettingsInfoModalFromPackage(
      translate(emailTranslationConstants.verifyEmailHeading),
      translate(emailTranslationConstants.emailVerificationSentDialog),
      translate(commonTranslationConstants.modal.submitButtonText),
      translate(commonTranslationConstants.modal.closeBtn),
      "Small",
    );

  const [errorModalV2, errorModalServiceV2] = useSettingsInfoModalFromPackage(
    translate(emailTranslationConstants.verifyEmailHeading),
    translate(verifyEmailError),
    translate(commonTranslationConstants.modal.submitButtonText),
    translate(commonTranslationConstants.modal.closeBtn),
    "Small",
  );

  // Choose between V1 and V2
  const emailVerificationSentModal = enableFoundationModals
    ? emailVerificationSentModalV2
    : emailVerificationSentModalV1;
  const emailVerificationSentModalService = enableFoundationModals
    ? emailVerificationSentModalServiceV2
    : emailVerificationSentModalServiceV1;

  const errorModal = enableFoundationModals ? errorModalV2 : errorModalV1;
  const errorModalService = enableFoundationModals ? errorModalServiceV2 : errorModalServiceV1;

  const sendVerificationEmail = async () => {
    try {
      await sendVerificationEmailMutation().unwrap();
      emailVerificationSentModalService.open();
    } catch (err) {
      setVerifyEmailError(err as string);
      errorModalService.open();
    }
  };

  // V1
  const [verifyEmailPromptModalV1, verifyEmailPromptModalServiceV1] = useSettingsModal({
    titleResourceId: emailTranslationConstants.emailVerificationRequiredHeading,
    bodyResourceId: contextForVerification,
    actionButtonTextResourceId: emailTranslationConstants.verifyEmailAction,
    onAction: sendVerificationEmail,
    size: "sm",
  });

  // V2
  const [verifyEmailPromptModalV2, verifyEmailPromptModalServiceV2] = useSettingsModalFromPackage({
    translatedTitle: translate(emailTranslationConstants.emailVerificationRequiredHeading),
    translatedBody: contextForVerification ? translate(contextForVerification) : "",
    translatedActionButtonText: translate(emailTranslationConstants.verifyEmailAction),
    translatedCloseLabel: translate(commonTranslationConstants.modal.closeBtn),
    onAction: sendVerificationEmail,
    size: "Small",
  });

  // Choose between V1 and V2
  const verifyEmailPromptModal = enableFoundationModals
    ? verifyEmailPromptModalV2
    : verifyEmailPromptModalV1;
  const verifyEmailPromptModalService = enableFoundationModals
    ? verifyEmailPromptModalServiceV2
    : verifyEmailPromptModalServiceV1;

  const modals = (
    <React.Fragment>
      {verifyEmailPromptModal}
      {emailVerificationSentModal}
      {errorModal}
    </React.Fragment>
  );

  const emailVerificationModalService: IModalService = {
    open: async () => {
      await sendVerificationEmail();
    },
    close: () => {
      emailVerificationSentModalService.close();
    },
  };

  return [
    modals,
    verifiedEmailRequired ? verifyEmailPromptModalService : emailVerificationModalService,
  ];
};

export default useVerifyEmailModal;
