import React, { useEffect, useState } from "react";
import { CurrentUser, DeviceMeta, SessionManagement } from "Roblox";
import { Modal } from "react-style-guide";
import { hybridResponseService } from "core-roblox-utilities";
import TwoStepVerification from "../components/twoStepVerification";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import useRedesignFlags from "../hooks/useRedesignFlags";
import useEppFlags from "../hooks/useEppFlags";
import { SESSION_MANAGEMENT_ELEMENT_ID, STATE_PROPERTIES_ELEMENT_ID } from "../app.config";
import { SecurityTabActionType } from "../store/action";
import { ConsoleType, ModalFragmentProps } from "../constants/types";
import ModalState from "../store/modalState";
import ModalGenericTextError from "../components/modal/genericTextError";
import ModalAuthenticatorEnable from "../components/modal/authenticatorEnable";
import ModalTwoStepDisable from "../components/modal/twoStepDisable";
import ModalTwoStepDisableAll from "../components/modal/twoStepDisableAll";
import ModalTwoStepEnableWarning from "../components/modal/twoStepEnableWarning";
import ModalTurnOnAuthenticator from "../components/modal/turnOnAuthenticator";
import ModalSecurityKeyEnable from "../components/modal/securityKeyEnable";
import ModalSecurityKeyError from "../components/modal/securityKeyError";
import ModalSecurityKeyName from "../components/modal/securityKeyName";
import ModalSecurityKeySuccess from "../components/modal/securityKeySuccess";
import ModalSecurityKeyManage from "../components/modal/securityKeyManage";
import ModalSecurityKeyDelete from "../components/modal/securityKeyDelete";
import ModalSecurityKeyDeleteSuccess from "../components/modal/securityKeyDeleteSuccess";
import ModalSecurityKeyDeletedWarning from "../components/modal/securityKeyDeletedWarning";
import ModalRecoveryCodesGenerate from "../components/modal/recoveryCodesGenerate";
import ModalRecoveryCodesDisplay from "../components/modal/recoveryCodesDisplay";
import ConsoleDisconnect from "../components/consoleDisconnect";
import EnhancedProtectionProgramCard from "../components/EnhancedProtectionProgramCard";
import EnhancedProtectionProgramDetails from "../components/EnhancedProtectionProgramDetails";
import { isPasskeyCompatible } from "../../common/compatibility";

type ModalSchema = {
  innerFragment: React.FC<ModalFragmentProps>;
  canClickBackdropOrEscToClose: boolean;
};

const createModalSchema = (
  innerFragment: React.FC<ModalFragmentProps>,
  canClickBackdropOrEscToClose: boolean,
): ModalSchema => {
  return {
    innerFragment,
    canClickBackdropOrEscToClose,
  };
};

const getModalSchema = (modalState: ModalState): ModalSchema | null => {
  const modalStateToInnerFragment = new Map<ModalState, ModalSchema>([
    [ModalState.GENERIC_TEXT_ERROR, createModalSchema(ModalGenericTextError, true)],
    [ModalState.TWO_STEP_DISABLE, createModalSchema(ModalTwoStepDisable, true)],
    [ModalState.TWO_STEP_DISABLE_ALL, createModalSchema(ModalTwoStepDisableAll, true)],
    [ModalState.AUTHENTICATOR_ENABLE, createModalSchema(ModalAuthenticatorEnable, true)],
    [ModalState.TWO_STEP_ENABLE_WARNING, createModalSchema(ModalTwoStepEnableWarning, true)],
    [
      ModalState.SECURITY_KEY_DELETED_WARNING,
      createModalSchema(ModalSecurityKeyDeletedWarning, true),
    ],
    [ModalState.TURN_ON_AUTHENTICATOR, createModalSchema(ModalTurnOnAuthenticator, true)],
    [ModalState.SECURITY_KEY_ENABLE, createModalSchema(ModalSecurityKeyEnable, true)],
    [ModalState.SECURITY_KEY_ERROR, createModalSchema(ModalSecurityKeyError, true)],
    [ModalState.SECURITY_KEY_NAME, createModalSchema(ModalSecurityKeyName, true)],
    [ModalState.SECURITY_KEY_SUCCESS, createModalSchema(ModalSecurityKeySuccess, true)],
    [ModalState.SECURITY_KEY_MANAGE, createModalSchema(ModalSecurityKeyManage, true)],
    [ModalState.SECURITY_KEY_DELETE, createModalSchema(ModalSecurityKeyDelete, true)],
    [
      ModalState.SECURITY_KEY_DELETE_SUCCESS,
      createModalSchema(ModalSecurityKeyDeleteSuccess, true),
    ],
    [ModalState.RECOVERY_CODES_GENERATE, createModalSchema(ModalRecoveryCodesGenerate, false)],
    [ModalState.RECOVERY_CODES_DISPLAY, createModalSchema(ModalRecoveryCodesDisplay, false)],
  ]);
  const modalSchema = modalStateToInnerFragment.get(modalState);

  return modalSchema !== undefined ? modalSchema : null;
};

const SecurityTabContainer: React.FC = () => {
  const {
    state: {
      requestService,
      systemFeedbackService,
      SystemFeedback,
      resources,
      hasConnectedXboxAccount,
      hasConnectedPlaystationAccount,
      modalStateAndProps,
      twoStepVerificationMetadata,
      userSettings,
    },
    dispatch,
  } = useSecurityTabContext();

  const { isRedesignEnabled, isSecurityTabRedesignEnabled } = useRedesignFlags();
  const { shouldShowEppCard, isEppEnabled } = useEppFlags();

  /*
   * Component State
   */

  const [isModalVisible, setIsModalVisible] = useState(true);
  const [displayTwoStepVerification, setDisplayTwoStepVerification] = useState<boolean>(false);
  const [isTwoStepToggleEnabled, setIsTwoStepToggleEnabled] = useState<boolean>(false);
  const [isEppDetailsVisible, setIsEppDetailsVisible] = useState<boolean>(false);

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
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.NONE,
      additionalModalProps: null,
    });
    // Reset the modal visible state (although the component itself will not be
    // rendered at this point).
    setIsModalVisible(true);
  };

  /*
   * Effects
   */

  const getXboxConnection = async (isDisconnectXboxEnabled: boolean) => {
    if (isDisconnectXboxEnabled) {
      const xboxConnectionResult = await requestService.xbox.getXboxConnection();
      if (!xboxConnectionResult.isError) {
        dispatch({
          type: SecurityTabActionType.SET_HAS_CONNECTED_XBOX_ACCOUNT,
          hasConnectedXboxAccount: xboxConnectionResult.value.hasConnectedXboxAccount,
        });
      } else {
        dispatch({
          type: SecurityTabActionType.SET_HAS_CONNECTED_XBOX_ACCOUNT,
          hasConnectedXboxAccount: false,
        });
      }
    }
  };

  const getPlaystationConnection = async () => {
    const playstationConnectionResult = await requestService.playstation.getPlaystationConnection();
    if (!playstationConnectionResult.isError) {
      dispatch({
        type: SecurityTabActionType.SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT,
        hasConnectedPlaystationAccount: playstationConnectionResult.value,
      });
    } else {
      dispatch({
        type: SecurityTabActionType.SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT,
        hasConnectedPlaystationAccount: false,
      });
    }
  };

  const getUserSettings = async () => {
    const getUserSettingsResult = await requestService.userSettingsApi.userSettings();
    if (getUserSettingsResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
      return;
    }

    dispatch({
      type: SecurityTabActionType.INITIALIZE_USER_SETTINGS,
      userSettings: getUserSettingsResult.value,
    });
  };

  const getMySettingsInfo = async () => {
    // TODO: Once account settings react migration is complete, we may be able
    // to pass the results as a prop in userSettings instead of
    // making a separate call to /my/settings/json.
    const getMySettingsInfoResult = await requestService.myAccount.getMySettingsInfo();
    if (getMySettingsInfoResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
      return;
    }
    await getXboxConnection(getMySettingsInfoResult.value.IsDisconnectXboxEnabled);

    dispatch({
      type: SecurityTabActionType.INITIALIZE_MY_SETTINGS_INFO,
      mySettingsInfo: getMySettingsInfoResult.value,
    });
  };

  const getSettingsUiPolicy = async () => {
    // TODO: Once account settings react migration is complete, we may be able
    // to pass displayTwoStepVerification as a prop in userSettings instead of
    // making a separate call to universal app configuration.
    const getSettingsUiPolicyResult =
      await requestService.universalAppConfiguration.getSettingsUiPolicy();
    if (getSettingsUiPolicyResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
      return;
    }
    setDisplayTwoStepVerification(getSettingsUiPolicyResult.value.displayTwoStepVerification);
  };

  const getStateProperties = () => {
    const statePropertiesElement = document.getElementById(STATE_PROPERTIES_ELEMENT_ID);
    if (statePropertiesElement?.dataset.isTwoStepToggleEnabled) {
      setIsTwoStepToggleEnabled(statePropertiesElement?.dataset.isTwoStepToggleEnabled === "true");
    }
  };

  const getPasskeyInfo = async () => {
    const listCredentialsResult = await requestService.authApi.listAllCredentials({ all: false });
    if (listCredentialsResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
      return;
    }
    dispatch({
      type: SecurityTabActionType.SET_PASSKEY_INFO,
      credentialsList: listCredentialsResult.value,
      isPasskeySupported: await isPasskeyCompatible({
        producer: DeviceMeta,
        hybridCallback: () =>
          hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
            {},
            10000,
          ),
      }),
    });
  };

  const getPhoneConfiguration = async () => {
    const getPhoneConfigurationResult = await requestService.phone.getPhoneConfiguration();
    if (getPhoneConfigurationResult.isError) {
      systemFeedbackService.warning(resources.MessageUnknownError);
    } else {
      dispatch({
        type: SecurityTabActionType.SET_PHONE_CONFIGURATION,
        phoneConfiguration: getPhoneConfigurationResult.value,
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void getUserSettings();
    // eslint-disable-next-line no-void
    void getMySettingsInfo();
    // eslint-disable-next-line no-void
    void getSettingsUiPolicy();
    // eslint-disable-next-line no-void
    void getPlaystationConnection();
    getStateProperties();
    // Eagerly fetch this even though we only need this in the next page in EPP details, so we
    // can avoid any flicker on the passkey list element. Unflagged because a single low-volume
    // call that is only ever used in a flagged component is unlikely to be a problem.
    // eslint-disable-next-line no-void
    void getPasskeyInfo();
    // eslint-disable-next-line no-void
    void getPhoneConfiguration();
  }, []);

  useEffect(() => {
    if (!isEppDetailsVisible) {
      SessionManagement.renderComponent({
        containerId: SESSION_MANAGEMENT_ELEMENT_ID,
        userHasConsoleSession: hasConnectedPlaystationAccount || hasConnectedXboxAccount,
      });
    }
  }, [hasConnectedPlaystationAccount, hasConnectedXboxAccount, isEppDetailsVisible]);

  /*
   * Component Markup
   */

  // We retrieve a schema to manually render an outer modal element instead of
  // delegating the modal render to the specific modal page component. This is
  // to prevent unwanted animations on modal updates due to modal components
  // being added and removed from the DOM.
  const modalSchema = getModalSchema(modalStateAndProps.modalState);

  return (
    <React.Fragment>
      {isEppDetailsVisible ? (
        <EnhancedProtectionProgramDetails onBackClick={() => setIsEppDetailsVisible(false)} />
      ) : (
        <React.Fragment>
          <div className={isRedesignEnabled ? "settings-redesign-enabled" : ""}>
            <div className="settings-v2-header" id="rbx-security-settings-header">
              <h2 data-testid="security-heading">{resources.Heading.Security}</h2>
            </div>
            {isEppEnabled !== null && shouldShowEppCard && (
              <div className="section" data-testid="epp-section">
                <div className="container-header">
                  <h3 className="font-header-2">{resources.Heading.EnhancedProtectionProgram}</h3>
                </div>
                <EnhancedProtectionProgramCard
                  title={resources.Heading.EnhancedProtectionProgram}
                  description={resources.Description.EnhancedProtectionProgram}
                  onCardClick={() => setIsEppDetailsVisible(true)}
                  eppEnrollmentStatus={userSettings?.eppEnrollmentStatus}
                  enrolledLabel={resources.Body.Enrolled}
                  unenrolledLabel={resources.Body.Unenrolled}
                  isUnder13={CurrentUser.isUnder13}
                />
              </div>
            )}
            {displayTwoStepVerification && isTwoStepToggleEnabled && <TwoStepVerification />}
            {hasConnectedXboxAccount && <ConsoleDisconnect consoleType={ConsoleType.XBOX} />}
            {hasConnectedPlaystationAccount && (
              <ConsoleDisconnect consoleType={ConsoleType.PLAYSTATION} />
            )}
          </div>
          <div id={SESSION_MANAGEMENT_ELEMENT_ID} data-testid="session-management-section" />
        </React.Fragment>
      )}

      {modalSchema && (
        <Modal
          className="modal-modern"
          show={isModalVisible}
          onHide={closeModal}
          onExited={setModalStateNone}
          backdrop={modalSchema.canClickBackdropOrEscToClose ? undefined : "static"}
          // The keyboard parameter prevents the modal from closing when the escape key is pressed
          keyboard={modalSchema.canClickBackdropOrEscToClose}
        >
          <modalSchema.innerFragment closeModal={closeModal} />
        </Modal>
      )}
      <SystemFeedback />
    </React.Fragment>
  );
};

export default SecurityTabContainer;
