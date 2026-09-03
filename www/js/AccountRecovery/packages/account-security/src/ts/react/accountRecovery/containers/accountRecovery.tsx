import React, { useEffect, useState } from "react";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Loading, Modal } from "react-style-guide";
import { UserProfileField, useUserProfiles } from "roblox-user-profiles";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import ComponentState from "../store/componentState";
import ModernCardContainer from "../../common/modernCardComponent/modernCardContainer";
import SendCode from "../components/sendCode";
import { CHALLENGE_CONTAINER_ID, LOG_PREFIX } from "../app.config";
import { AccountRecoveryActionType } from "../store/action";
import IdentifierInput from "../components/identifierInput";
import AccountVerifiedConfirmation from "../components/accountVerifiedConfirmation";
import ResendOrVerifyCode from "../components/resendOrVerifyCode";
import VerifyRecoveryIntent from "../components/verifyRecoveryIntent";
import DisambiguationPage from "../components/disambiguationPage";
import RecoveryRouter from "../components/recoveryRouter";
import RecoverySuccess from "../components/recoverySuccess";
import ModalUpdateEmail from "../components/modal/updateEmail";
import ModalAddNewPasskey from "../components/modal/addNewPasskey";
import ModalSaveOrDeleteTwoStepMethod from "../components/modal/saveOrDeleteTwoStepMethod";
import ModalInvalidateCredentials from "../components/modal/invalidateCredentials";
import ModalAccountSecured from "../components/modal/accountSecured";
import ModalNoChangesMade from "../components/modal/noChangesMade";
import ModalState from "../store/modalState";
import {
  handleContinueRecovery,
  handleRequestRecovery,
  ProcessedIdentifier,
} from "../commonHelpers";
import {
  ContinueRecoveryReturnType,
  RecoveryState,
  RequestedRecoveryType,
} from "../../../common/request/types/accountRecovery";
import ContinueFallback from "../components/continueFallback";
import CannotRecoverAccount from "../components/cannotRecoverAccount";

type ModalSchema = {
  innerFragment: React.FC;
  canClickBackdropOrEscToClose: boolean;
};

const getModalSchema = (modalState: ModalState): ModalSchema | null => {
  switch (modalState) {
    case ModalState.UPDATE_EMAIL:
      return {
        innerFragment: ModalUpdateEmail,
        canClickBackdropOrEscToClose: false,
      };
    case ModalState.ADD_NEW_PASSKEY:
      return {
        innerFragment: ModalAddNewPasskey,
        canClickBackdropOrEscToClose: false,
      };
    case ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD:
      return {
        innerFragment: ModalSaveOrDeleteTwoStepMethod,
        canClickBackdropOrEscToClose: false,
      };
    case ModalState.INVALIDATE_CREDENTIALS:
      return {
        innerFragment: ModalInvalidateCredentials,
        canClickBackdropOrEscToClose: false,
      };
    case ModalState.ACCOUNT_SECURED:
      return {
        innerFragment: ModalAccountSecured,
        canClickBackdropOrEscToClose: false,
      };
    case ModalState.NO_CHANGES_MADE:
      return {
        innerFragment: ModalNoChangesMade,
        canClickBackdropOrEscToClose: false,
      };
    default:
      return null;
  }
};

type ComponentSchema = {
  innerFragment: React.FC;
};

const getComponentSchema = (componentState: ComponentState): ComponentSchema | null => {
  switch (componentState) {
    case ComponentState.IDENTIFIER_INPUT:
      return {
        innerFragment: IdentifierInput,
      };
    case ComponentState.SEND_CODE:
      return {
        innerFragment: SendCode,
      };
    case ComponentState.ACCOUNT_VERIFIED_CONFIRMATION:
      return {
        innerFragment: AccountVerifiedConfirmation,
      };
    case ComponentState.RESEND_OR_VERIFY_CODE:
      return {
        innerFragment: ResendOrVerifyCode,
      };
    case ComponentState.VERIFY_RECOVERY_INTENT:
      return {
        innerFragment: VerifyRecoveryIntent,
      };
    case ComponentState.CONTINUE_FALLBACK:
      return {
        innerFragment: ContinueFallback,
      };
    case ComponentState.DISAMBIGUATION_PAGE:
      return {
        innerFragment: DisambiguationPage,
      };
    case ComponentState.RESET_PASSWORD:
      return {
        innerFragment: RecoveryRouter,
      };
    case ComponentState.RECOVERY_SUCCESS:
      return {
        innerFragment: RecoverySuccess,
      };
    case ComponentState.CANNOT_RECOVER_ACCOUNT:
      return {
        innerFragment: CannotRecoverAccount,
      };
    default:
      return null;
  }
};

const AccountRecoveryContainer: React.FC = () => {
  /*
   * Component State
   */
  const {
    state: {
      resources,
      requestService,
      eventService,
      recoverySessionId,
      componentStateAndProps,
      userIdToRecover,
      modalStateAndProps,
      SystemFeedback,
      recoverPassword,
      recover2sv,
    },
    dispatch,
  } = useAccountRecoveryContext();

  const [isModalVisible, setIsModalVisible] = useState(true);

  const { data: userProfilesData } = useUserProfiles(
    [userIdToRecover ?? 0],
    [
      UserProfileField.Names.CombinedName,
      UserProfileField.Names.Username,
      UserProfileField.Names.DisplayName,
      UserProfileField.Names.Alias,
    ],
  );

  const handleRequestRecoveryResult = (
    requestRecoveryResult: {
      recoveryState: RecoveryState;
      recoverySessionId: string;
      processedIdentifier: ProcessedIdentifier;
    } | null,
    identifier: string,
  ) => {
    if (requestRecoveryResult === null) {
      dispatch({
        type: AccountRecoveryActionType.SET_COMPONENT_STATE,
        recoverySessionState: RecoveryState.AccountIdentifierRequired,
        componentState: ComponentState.IDENTIFIER_INPUT,
        additionalComponentProps: null,
      });
      return;
    }

    switch (requestRecoveryResult.recoveryState) {
      case RecoveryState.ContactMethodVerificationRequired:
        eventService.sendRecoveryInitializedFromAutofillEvent(
          requestRecoveryResult.recoverySessionId,
          requestRecoveryResult.processedIdentifier.identifierType,
          "sendCode",
        );
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: requestRecoveryResult.recoveryState,
          componentState: ComponentState.SEND_CODE,
          additionalComponentProps: {
            phonePrefixIndexAutoFill: null,
            contactMethodAutoFill:
              requestRecoveryResult.processedIdentifier.identifierType !== "username"
                ? identifier
                : "",
          },
        });
        break;
      case RecoveryState.AccountVerified:
        eventService.sendRecoveryInitializedFromAutofillEvent(
          requestRecoveryResult.recoverySessionId,
          requestRecoveryResult.processedIdentifier.identifierType,
          "accountVerifiedConfirmation",
        );
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: requestRecoveryResult.recoveryState,
          componentState: ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
          additionalComponentProps: null,
        });
        break;

      default:
        eventService.sendRecoveryInitializedFromAutofillEvent(
          requestRecoveryResult.recoverySessionId,
          requestRecoveryResult.processedIdentifier.identifierType,
          "identifierInput",
        );
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AccountIdentifierRequired,
          componentState: ComponentState.IDENTIFIER_INPUT,
          additionalComponentProps: null,
        });
        break;
    }
  };

  const handleContinueRecoveryResult = (
    continueRecoveryResult: ContinueRecoveryReturnType,
    handleError: (error: string) => void,
    recoverySessionIdToContinueFrom: string,
    userIdToContinueFrom: number,
  ) => {
    if (
      continueRecoveryResult.recoveryState !== RecoveryState.AccountVerified &&
      continueRecoveryResult.recoveryState !== RecoveryState.AwaitingReevaluation &&
      continueRecoveryResult.recoveryState !== RecoveryState.ContactMethodVerificationRequired
    ) {
      handleError("");
      return;
    }
    dispatch({
      type: AccountRecoveryActionType.SET_CONTINUING_RECOVERY,
      continuingRecovery: true,
    });
    dispatch({
      type: AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV,
      recoverPassword: true,
      recover2sv: true,
    });
    dispatch({
      type: AccountRecoveryActionType.SET_RECOVERY_SESSION_ID,
      recoverySessionId: recoverySessionIdToContinueFrom,
    });
    dispatch({
      type: AccountRecoveryActionType.SET_USER_ID_TO_RECOVER,
      userIdToRecover: userIdToContinueFrom,
    });
    switch (continueRecoveryResult.recoveryState) {
      case RecoveryState.AccountVerified:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AccountVerified,
          componentState: ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
          additionalComponentProps: null,
        });
        break;
      case RecoveryState.AwaitingReevaluation:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AwaitingReevaluation,
          componentState: ComponentState.CANNOT_RECOVER_ACCOUNT,
          additionalComponentProps: null,
        });
        break;
      case RecoveryState.ContactMethodVerificationRequired:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.ContactMethodVerificationRequired,
          componentState: ComponentState.SEND_CODE,
          additionalComponentProps: {
            phonePrefixIndexAutoFill: null,
            contactMethodAutoFill: "",
            contactMethodNumber: 1,
            previousRecoveryMethod: continueRecoveryResult.previousRecoveryMethod ?? "",
            previousRecoveryMethodTypes: continueRecoveryResult.previousRecoveryMethodTypes ?? [],
            nextRecoveryMethodTypes: continueRecoveryResult.nextRecoveryMethodTypes ?? [],
          },
        });
        break;
      default:
        handleError("");
        break;
    }
  };

  // Setup effect that only runs once.
  useEffect(() => {
    const initRecovery = async () => {
      const prefixListResult = await requestService.phone.getPhonePrefixList();
      if (prefixListResult.isError) {
        // eslint-disable-next-line no-console
        console.warn(LOG_PREFIX, "failed to get phone prefix list");
      } else {
        dispatch({
          type: AccountRecoveryActionType.SET_PHONE_PREFIX_LIST,
          phonePrefixList: prefixListResult.value,
        });
      }

      const queryParams = new URLSearchParams(window.location.search);
      let identifierQuery = queryParams.get("identifier");

      let continuingRecovery = false;
      let recoverySessionIdToContinueFrom = recoverySessionId;
      let userIdToContinueFrom = userIdToRecover ?? 0;
      let recoverPasswordFromOrigin = recoverPassword;
      let recover2svFromOrigin = recover2sv;

      const origin = queryParams.get("origin") ?? "";
      if (origin === "passwordReset2SV") {
        const usernameToContinueFrom = queryParams.get("username") ?? "";
        const userByUsernameResult =
          await requestService.usersApi.getUserByUsername(usernameToContinueFrom);
        if (userByUsernameResult.isError) {
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AccountIdentifierRequired,
            componentState: ComponentState.IDENTIFIER_INPUT,
            additionalComponentProps: null,
          });
          return;
        }
        userIdToContinueFrom = userByUsernameResult.value.data[0]?.id ?? 0;
        continuingRecovery = true;
        recoverySessionIdToContinueFrom = queryParams.get("recoverySessionId") ?? "";
      } else if (origin === "login2SV") {
        dispatch({
          type: AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV,
          recoverPassword: false,
          recover2sv: true,
        });
        recoverPasswordFromOrigin = false;
        recover2svFromOrigin = true;
        identifierQuery = queryParams.get("username");
      }
      const identifier = decodeURIComponent(identifierQuery || "");

      const basePath = window.location.href.split("?")[0];
      window.history.replaceState(null, "", basePath);

      if (continuingRecovery) {
        const onError = (_: string) => {
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AccountIdentifierRequired,
            componentState: ComponentState.IDENTIFIER_INPUT,
            additionalComponentProps: null,
          });
        };
        await handleContinueRecovery({
          requestService,
          resources,
          recoverySessionId: recoverySessionIdToContinueFrom,
          userId: userIdToContinueFrom,
          onSuccess: (continueRecoveryResult: ContinueRecoveryReturnType) => {
            handleContinueRecoveryResult(
              continueRecoveryResult,
              onError,
              recoverySessionIdToContinueFrom,
              userIdToContinueFrom,
            );
          },
          onError,
          on2svAbandoned: () => onError(""),
          recover2sv: true,
        });
      } else {
        const requestedRecoveryTypes: RequestedRecoveryType[] = [];
        if (recover2svFromOrigin) {
          requestedRecoveryTypes.push("twostepverification");
        }
        if (recoverPasswordFromOrigin) {
          requestedRecoveryTypes.push("password");
        }
        const requestRecoveryResult = await pipe(
          identifierQuery,
          O.fromNullable,
          O.map(identifierAutofill =>
            handleRequestRecovery(
              decodeURIComponent(identifierAutofill),
              prefixListResult.isError ? [] : prefixListResult.value,
              null,
              requestedRecoveryTypes,
              recoverPasswordFromOrigin,
              recover2svFromOrigin,
              recoverySessionId,
              requestService,
              resources,
              dispatch,
              () => {
                dispatch({
                  type: AccountRecoveryActionType.SET_RECOVER_PASSWORD_AND_2SV,
                  recoverPassword: true,
                  recover2sv: false,
                });
                dispatch({
                  type: AccountRecoveryActionType.SET_COMPONENT_STATE,
                  recoverySessionState: RecoveryState.AccountIdentifierRequired,
                  componentState: ComponentState.IDENTIFIER_INPUT,
                  additionalComponentProps: null,
                });
              },
            ),
          ),
          O.getOrElseW(() => Promise.resolve(null)),
        );
        handleRequestRecoveryResult(requestRecoveryResult, identifier);
      }
    };
    eventService.sendPageLoadEvent();
    // eslint-disable-next-line no-void
    void initRecovery();
  }, []);

  useEffect(() => {
    const setUserNames = async () => {
      const username = userProfilesData
        ? userProfilesData[userIdToRecover ?? 0]?.names?.username
        : null;
      const combinedName = userProfilesData
        ? userProfilesData[userIdToRecover ?? 0]?.names?.combinedName
        : null;
      if (!userIdToRecover || !username || !combinedName) return;

      const userInfoResult = await requestService.usersApi.getUserById(userIdToRecover.toString());
      if (userInfoResult.isError) {
        // eslint-disable-next-line no-console
        console.warn(LOG_PREFIX, "Failed to fetch user info for ban check", userInfoResult.error);
        dispatch({ type: AccountRecoveryActionType.SET_USER_NAMES, username, combinedName });
        return;
      }

      dispatch({
        type: AccountRecoveryActionType.SET_USER_NAMES,
        username: userInfoResult.value?.isBanned ? userInfoResult.value.name : username,
        combinedName,
      });
    };
    // eslint-disable-next-line no-void
    void setUserNames();
  }, [userIdToRecover, userProfilesData, dispatch]);

  /*
   * Event Handlers
   */

  const closeModal = () => setIsModalVisible(false);
  /**
   * While it is typical to trigger a modal close `onHide` (a property of every
   * modal), we do not set the modal state to `NONE` in a handler attached to
   * that event, since doing so would remove the modal element from the DOM
   * immediately and prevent a close animation from running.
   *
   * To allow the animation to run before setting a `NONE` state, we attach
   * this function to the modal's `onExited` event.
   */
  const setModalStateNone = () => {
    dispatch({
      type: AccountRecoveryActionType.SET_MODAL_STATE,
      modalState: ModalState.NONE,
      additionalModalProps: null,
    });
    // Reset the modal visible state (although the component itself will not be
    // rendered at this point).
    setIsModalVisible(true);
  };

  /*
   * Component Markup
   */
  const componentSchema = getComponentSchema(componentStateAndProps.componentState);
  const modalSchema = getModalSchema(modalStateAndProps.modalState);

  return (
    <div className="account-recovery-page">
      <ModernCardContainer>
        {componentSchema ? <componentSchema.innerFragment /> : <Loading />}
      </ModernCardContainer>
      {modalSchema && (
        <Modal
          className="modal-modern account-recovery"
          show={isModalVisible}
          onHide={closeModal}
          onExited={setModalStateNone}
          backdrop={modalSchema.canClickBackdropOrEscToClose ? undefined : "static"}
          // The keyboard parameter prevents the modal from closing when the escape key is pressed
          keyboard={modalSchema.canClickBackdropOrEscToClose}
        >
          <modalSchema.innerFragment />
        </Modal>
      )}
      <div id={CHALLENGE_CONTAINER_ID} />
      <SystemFeedback />
    </div>
  );
};

export default AccountRecoveryContainer;
