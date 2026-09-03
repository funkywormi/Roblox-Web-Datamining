import { useCallback, useMemo } from "react";
import { DeviceMeta, AccountIntegrityChallengeService } from "Roblox";
import { authenticatedUser } from "header-scripts";
import { debounce } from "../utils/helperUtils";
import { MediaType } from "../../challenge/twoStepVerification";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import useTwoStepVerificationState from "./useTwoStepVerificationState";
import useDeleteAllSecurityKeys from "../hooks/useDeleteAllSecurityKeys";
import useRedesignFlags from "../hooks/useRedesignFlags";
import useSecurityKeyWarningModal from "../hooks/useSecurityKeyWarningModal";
import useGenericErrorModal from "../hooks/useGenericErrorModal";
import usePlatformSupportsPasskeyAndSecurityKey from "../../common/hooks/usePlatformSupportsPasskeyAndSecurityKey";

export type TwoStepVerificationActionsReturn = {
  handleOptionChange: (mediaType: MediaType) => void;
  toggleAuthenticator: (emailVerified: boolean) => void;
  toggleEmail: () => Promise<void>;
  toggleSecurityKey: () => Promise<void>;
  beginSecurityKeyRegistration: (skipAuthenticatorCheck?: boolean) => Promise<void>;
  manageSecurityKey: () => Promise<void>;
};

const useTwoStepVerificationActions = (): TwoStepVerificationActionsReturn => {
  const { state, dispatch } = useSecurityTabContext();
  const {
    eventService,
    requestService,
    resources,
    enabledMediaTypes,
    twoStepVerificationMetadata,
  } = state;

  const { isRedesignEnabled } = useRedesignFlags();

  // Use the state hook to get computed values and helpers
  const { selectedOption, isEmailVerified } = useTwoStepVerificationState();

  // Use the hooks for security key operations
  const { deleteAllSecurityKeys } = useDeleteAllSecurityKeys();
  const { showWarningModal } = useSecurityKeyWarningModal();
  const { showGenericErrorModal } = useGenericErrorModal();
  const { platformSupportsSecurityKey } = usePlatformSupportsPasskeyAndSecurityKey({
    isAndroidSecurityKeyEnabled: twoStepVerificationMetadata.isAndroidSecurityKeyEnabled,
  });

  const checkPlatformSupport = useCallback(() => {
    if (!platformSupportsSecurityKey) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.SecurityKey.PlatformNotSupported,
          body: resources.Description.SecurityKey.WebOnly,
          button: resources.Action.Dialog.Success,
        },
      });
      return false;
    }
    return true;
  }, [platformSupportsSecurityKey, dispatch, resources]);

  const { Generic } = AccountIntegrityChallengeService;

  const showEmailRequirementModal = useCallback(() => {
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.GENERIC_TEXT_ERROR,
      additionalModalProps: {
        title: resources.Label.Dialog.EmailRequired,
        body: resources.Description.Dialog.MissingEmailTwoStepVerification,
        button: resources.Action.Dialog.Success,
      },
    });
  }, [dispatch, resources]);

  const showTwoStepDisableModal = useCallback(
    (mediaType: MediaType) => {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.TWO_STEP_DISABLE,
        additionalModalProps: {
          mediaTypeToDisable: mediaType,
        },
      });
    },
    [dispatch],
  );

  // Analytics helpers
  const sendEnabledEvent = useCallback(() => {
    eventService.sendTwoStepVerificationEnabledEvent();
  }, [eventService]);

  const sendDisabledEvent = useCallback(() => {
    eventService.sendTwoStepVerificationDisabledEvent();
  }, [eventService]);

  const toggleAuthenticator = useCallback(
    (emailVerified: boolean) => {
      const currentlyEnabled = enabledMediaTypes.includes(MediaType.Authenticator);
      const hasSecurityKey = enabledMediaTypes.includes(MediaType.SecurityKey);

      if (currentlyEnabled) {
        sendDisabledEvent();
        // switching from (enabled) security key to authenticator requires us to delete all security keys
        // do not need enable event for authenticator since it is already enabled
        if (hasSecurityKey && isRedesignEnabled) {
          showWarningModal(resources.Description.SecurityKey.AuthenticatorDeletion);
        } else {
          showTwoStepDisableModal(MediaType.Authenticator);
        }

        return;
      }

      sendEnabledEvent();

      if (emailVerified) {
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.AUTHENTICATOR_ENABLE,
          additionalModalProps: {},
        });
      } else {
        showEmailRequirementModal();
      }
    },
    [
      enabledMediaTypes,
      sendEnabledEvent,
      sendDisabledEvent,
      showTwoStepDisableModal,
      isRedesignEnabled,
      dispatch,
      showEmailRequirementModal,
      showWarningModal,
      resources.Description.SecurityKey.AuthenticatorDeletion,
    ],
  );

  // Extract the registration flow into a separate function to prevent infinite loop
  const beginSecurityKeyRegistration = useCallback(
    async (skipAuthenticatorCheck = false) => {
      if (!skipAuthenticatorCheck && !isEmailVerified()) {
        showEmailRequirementModal();
        return;
      }

      if (!skipAuthenticatorCheck && !enabledMediaTypes.includes(MediaType.Authenticator)) {
        // New redesigned flow: skip modal and go directly to authenticator setup
        // Pass security key registration as callback to authenticator setup
        if (isRedesignEnabled) {
          dispatch({
            type: SecurityTabActionType.SET_MODAL_STATE,
            modalState: ModalState.AUTHENTICATOR_ENABLE,
            additionalModalProps: {
              onAuthenticatorComplete: () => beginSecurityKeyRegistration(true), // Skip check on callback
            },
          });
          return;
        }
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.TURN_ON_AUTHENTICATOR,
          additionalModalProps: {
            enableAuthenticatorFunction: () => toggleAuthenticator(isEmailVerified()),
          },
        });
        return;
      }

      // Platform support check using the shared hook
      const canProceed = checkPlatformSupport();
      if (!canProceed) {
        return;
      }

      // Gets the challenge id to register the security key
      const enableSecurityKeyResult = await requestService.twoStepVerification.enableSecurityKey(
        authenticatedUser.id?.toString() ?? "",
      );

      if (enableSecurityKeyResult.isError) {
        // Don't show error modal if user dismissed the challenge
        if (!Generic.ChallengeError.matchAbandoned(enableSecurityKeyResult.errorRaw)) {
          showGenericErrorModal();
        }
        return;
      }

      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.SECURITY_KEY_ENABLE,
        additionalModalProps: {
          creationOptions: enableSecurityKeyResult.value.creationOptions,
          sessionId: enableSecurityKeyResult.value.sessionId,
          isInApp: DeviceMeta ? DeviceMeta().isInApp : false,
          registerSecurityKeyFunction: () => beginSecurityKeyRegistration(),
        },
      });
    },
    [
      enabledMediaTypes,
      requestService,
      showGenericErrorModal,
      dispatch,
      toggleAuthenticator,
      isEmailVerified,
      showEmailRequirementModal,
      isRedesignEnabled,
      Generic.ChallengeError,
      checkPlatformSupport,
    ],
  );

  const toggleEmail = useCallback(async () => {
    const isEmailEnabled = enabledMediaTypes.includes(MediaType.Email);

    // Helper function to handle the core email enablement logic
    const handleEmailEnablement = async (successAction: () => Promise<void> | void) => {
      const enableResult = await requestService.twoStepVerification.enableEmailTwoStepVerification(
        authenticatedUser.id?.toString() ?? "",
      );

      if (enableResult.isError) {
        if (!Generic.ChallengeError.matchAbandoned(enableResult.errorRaw)) {
          showGenericErrorModal();
        }
      } else {
        try {
          await successAction();
        } catch (error) {
          if (!Generic.ChallengeError.matchAbandoned(error)) {
            showGenericErrorModal();
          }
        }
      }
    };

    if (isEmailEnabled) {
      sendDisabledEvent();
      showTwoStepDisableModal(MediaType.Email);
      return;
    }

    sendEnabledEvent();

    if (!isEmailVerified()) {
      showEmailRequirementModal();
      return;
    }

    const hasSecurityKey = enabledMediaTypes.includes(MediaType.SecurityKey);
    const hasAuthenticator = enabledMediaTypes.includes(MediaType.Authenticator);

    if (isRedesignEnabled && (hasSecurityKey || hasAuthenticator)) {
      showWarningModal(resources.Description.TurnOnLowerSecurity2SVMethod, {
        skipDeletion: true,
        onConfirm: async () => {
          if (hasSecurityKey) {
            await handleEmailEnablement(async () => {
              dispatch({
                type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
                mediaType: MediaType.Email,
              });
              await deleteAllSecurityKeys();
            });
          } else if (hasAuthenticator) {
            await handleEmailEnablement(() => {
              dispatch({
                type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
                mediaType: MediaType.Email,
              });
              dispatch({
                type: SecurityTabActionType.DISABLE_MEDIA_TYPE,
                mediaType: MediaType.Authenticator,
              });
            });
          }
        },
      });
      return;
    }

    // Default : Enable email directly if no other methods are present
    await handleEmailEnablement(() => {
      dispatch({
        type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
        mediaType: MediaType.Email,
      });
    });
  }, [
    enabledMediaTypes,
    sendEnabledEvent,
    sendDisabledEvent,
    showTwoStepDisableModal,
    isEmailVerified,
    showEmailRequirementModal,
    requestService,
    showGenericErrorModal,
    dispatch,
    isRedesignEnabled,
    showWarningModal,
    deleteAllSecurityKeys,
    resources.Description.TurnOnLowerSecurity2SVMethod,
    Generic.ChallengeError,
  ]);

  // relies on authenticator being enabled first
  const toggleSecurityKey = useCallback(async () => {
    const currentlyEnabled = enabledMediaTypes.includes(MediaType.SecurityKey);

    if (currentlyEnabled) {
      // Handle disable by show management modal
      const listSecurityKeyResult = await requestService.twoStepVerification.listSecurityKey(
        authenticatedUser.id?.toString() ?? "",
      );

      if (listSecurityKeyResult.isError) {
        showGenericErrorModal();
        return;
      }

      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.SECURITY_KEY_MANAGE,
        additionalModalProps: {
          registeredKeysList: listSecurityKeyResult.value.credentials,
          // Call the registration function directly, fixing the infinite loop
          registerSecurityKeyFunction: () => beginSecurityKeyRegistration(),
        },
      });
      return;
    }

    // Initial registration also uses the new function
    await beginSecurityKeyRegistration();
  }, [
    enabledMediaTypes,
    requestService,
    showGenericErrorModal,
    dispatch,
    beginSecurityKeyRegistration,
  ]);

  // Prevent rapid multiple clicks from triggering duplicate API calls with debounce
  const handleOptionChange: (mediaType: MediaType) => void = useMemo(() => {
    const [debouncedHandler] = debounce(async (mediaType: MediaType) => {
      // clicking same option should be no op
      if (selectedOption === mediaType) {
        return;
      }

      switch (mediaType) {
        case MediaType.None:
          // Show single modal to disable all enabled methods
          if (enabledMediaTypes.length > 0) {
            dispatch({
              type: SecurityTabActionType.SET_MODAL_STATE,
              modalState: ModalState.TWO_STEP_DISABLE_ALL,
              additionalModalProps: {
                enabledMethods: [...enabledMediaTypes] as MediaType[],
              },
            });
          }
          break;
        case MediaType.Authenticator:
          toggleAuthenticator(isEmailVerified());
          break;
        case MediaType.Email:
          await toggleEmail();
          break;
        case MediaType.SecurityKey:
          await toggleSecurityKey();
          break;
        default:
          break;
      }
    }, 300);
    return debouncedHandler;
  }, [
    selectedOption,
    toggleAuthenticator,
    toggleEmail,
    toggleSecurityKey,
    isEmailVerified,
    enabledMediaTypes,
    dispatch,
  ]);

  // Security Key Management
  const manageSecurityKey = useCallback(async () => {
    const listSecurityKeyResult = await requestService.twoStepVerification.listSecurityKey(
      authenticatedUser.id!.toString(),
    );
    if (listSecurityKeyResult.isError) {
      // Don't show error modal if user dismissed the challenge
      if (!Generic.ChallengeError.matchAbandoned(listSecurityKeyResult.errorRaw)) {
        showGenericErrorModal();
      }
      return;
    }
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_MANAGE,
      additionalModalProps: {
        registeredKeysList: listSecurityKeyResult.value.credentials,
        registerSecurityKeyFunction: beginSecurityKeyRegistration,
      },
    });
  }, [
    requestService,
    showGenericErrorModal,
    beginSecurityKeyRegistration,
    Generic.ChallengeError,
    dispatch,
  ]);

  return {
    handleOptionChange,
    toggleAuthenticator,
    toggleEmail,
    toggleSecurityKey,
    beginSecurityKeyRegistration,
    manageSecurityKey,
  };
};

export default useTwoStepVerificationActions;
