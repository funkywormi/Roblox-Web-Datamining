import React from "react";
import { PromptType } from "../../../common/request/types/promptAssignments";
import ChallengeDialog from "../../common/challengeDialog";
import BannerAccountSecurity from "../components/bannerAccountSecurity";
import ModalAccountRestoresPolicyUpsell from "../components/modal/accountRestoresPolicyUpsell/upsell";
import ModalAuthenticatorUpsellDownload from "../components/modal/authenticatorUpsell/download";
import ModalAuthenticatorUpsellIntro from "../components/modal/authenticatorUpsell/intro";
import ModalChangePasswordConfirmation from "../components/modal/changePassword/confirmation";
import ModalChangePasswordForm from "../components/modal/changePassword/form";
import ModalChangePasswordIntro from "../components/modal/changePassword/intro";
import ModalDismissConfirmation from "../components/modal/dismissConfirmation";
import ModalEmail2SVUpsell from "../components/modal/email2SVUpsell/intro";
import { ModalFragmentProps } from "../constants/types";
import useAccountSecurityPromptContext from "../hooks/useAccountSecurityPromptContext";
import { AccountSecurityPromptActionType } from "../store/action";
import ModalState from "../store/modalState";

type ModalSchema = {
  innerFragment: React.FC<ModalFragmentProps>;
  canClickBackdropToClose: boolean;
};

const getModalSchema = (modalState: ModalState): ModalSchema | null => {
  switch (modalState) {
    case ModalState.CHANGE_PASSWORD_INTRO:
      return {
        innerFragment: ModalChangePasswordIntro,
        canClickBackdropToClose: true,
      };
    case ModalState.CHANGE_PASSWORD_FORM:
      return {
        innerFragment: ModalChangePasswordForm,
        canClickBackdropToClose: false,
      };
    case ModalState.CHANGE_PASSWORD_CONFIRMATION:
      return {
        innerFragment: ModalChangePasswordConfirmation,
        canClickBackdropToClose: true,
      };
    case ModalState.CHANGE_PASSWORD_DISMISS_CONFIRMATION:
      return {
        innerFragment: ModalDismissConfirmation,
        canClickBackdropToClose: false,
      };
    case ModalState.AUTHENTICATOR_UPSELL_OPENING:
      return {
        innerFragment: ModalAuthenticatorUpsellIntro,
        canClickBackdropToClose: false,
      };
    case ModalState.AUTHENTICATOR_UPSELL_DOWNLOAD_APPS:
      return {
        innerFragment: ModalAuthenticatorUpsellDownload,
        canClickBackdropToClose: false,
      };
    case ModalState.ACCOUNT_RESTORE_POLICY_UPSELL:
      return {
        innerFragment: ModalAccountRestoresPolicyUpsell,
        canClickBackdropToClose: false,
      };
    case ModalState.EMAIL_2SV_UPSELL:
      return {
        innerFragment: ModalEmail2SVUpsell,
        canClickBackdropToClose: false,
      };
    default:
      return null;
  }
};

const AccountSecurityPromptContainer: React.FC = () => {
  const {
    state: { isFlowComplete, modalState, promptAssignment },
    dispatch,
  } = useAccountSecurityPromptContext();

  /*
   * Event Handlers
   */

  const closeModal = () =>
    dispatch({
      type: AccountSecurityPromptActionType.SET_MODAL_STATE,
      modalState: ModalState.NONE,
    });

  /*
   * Component Markup
   */

  // We retrieve a schema to manually render an outer modal element instead of
  // delegating the modal render to the specific modal page component. This is
  // to prevent unwanted animations on modal updates due to modal components
  // being added and removed from the DOM.
  const modalSchema = getModalSchema(modalState);

  const showModalDirectly =
    promptAssignment.promptType === PromptType.AUTHENTICATOR_UPSELL ||
    promptAssignment.promptType === PromptType.ACCOUNT_RESTORES_POLICY_UPSELL ||
    (promptAssignment.promptType === PromptType.BROADER_AUTHENTICATOR_UPSELL &&
      promptAssignment.isGeneric !== true &&
      !promptAssignment.metadata.showBanner) ||
    (promptAssignment.promptType === PromptType.EMAIL_2SV_UPSELL &&
      promptAssignment.isGeneric !== true &&
      !promptAssignment.metadata.showBanner);

  return (
    <React.Fragment>
      {!isFlowComplete && !showModalDirectly && <BannerAccountSecurity />}
      {modalSchema && (
        <ChallengeDialog
          open
          onClose={closeModal}
          isBackdropDismissible={modalSchema.canClickBackdropToClose}
          // The text colour is set here so it doesn't follow the host page's body.
          className="account-security-prompt-dialog content-default"
        >
          <modalSchema.innerFragment closeModal={closeModal} />
        </ChallengeDialog>
      )}
    </React.Fragment>
  );
};

export default AccountSecurityPromptContainer;
