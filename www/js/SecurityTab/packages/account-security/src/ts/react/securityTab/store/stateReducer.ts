import { MediaType } from "../../challenge/twoStepVerification";
import { ModalStateAndProps } from "../constants/types";
import { SecurityTabAction, SecurityTabActionType } from "./action";
import { SecurityTabState } from "./state";

const securityTabStateReducer = (
  oldState: SecurityTabState,
  action: SecurityTabAction,
): SecurityTabState => {
  const newState = { ...oldState };
  switch (action.type) {
    case SecurityTabActionType.INITIALIZE_MY_SETTINGS_INFO:
      newState.mySettingsInfo = action.mySettingsInfo;
      return newState;

    case SecurityTabActionType.INITIALIZE_TWO_STEP_VERIFICATION:
      newState.twoStepVerificationMetadata = action.metadata;
      newState.enabledMediaTypes = action.enabledMediaTypes;
      return newState;

    case SecurityTabActionType.SET_PASSKEY_INFO:
      newState.credentialsList = action.credentialsList;
      newState.isPasskeySupported = action.isPasskeySupported;
      return newState;

    case SecurityTabActionType.INITIALIZE_USER_SETTINGS:
      newState.userSettings = action.userSettings;
      return newState;

    case SecurityTabActionType.SET_PHONE_CONFIGURATION:
      newState.phoneConfiguration = action.phoneConfiguration;
      return newState;

    case SecurityTabActionType.SET_MODAL_STATE:
      newState.modalStateAndProps = {
        modalState: action.modalState,
        additionalModalProps: action.additionalModalProps,
      } as ModalStateAndProps;
      return newState;

    case SecurityTabActionType.ENABLE_MEDIA_TYPE:
      if (newState.enabledMediaTypes.includes(action.mediaType)) {
        return newState;
      }
      if (newState.twoStepVerificationMetadata.isSingleMethodEnforcementEnabled) {
        if (action.mediaType === MediaType.SecurityKey) {
          // Authenticator must have been enabled before security keys are enabled.
          newState.enabledMediaTypes = [MediaType.Authenticator, action.mediaType];
        } else {
          newState.enabledMediaTypes = [action.mediaType];
        }
      } else {
        newState.enabledMediaTypes = newState.enabledMediaTypes.concat([action.mediaType]);
      }
      return newState;

    case SecurityTabActionType.DISABLE_MEDIA_TYPE: {
      const index = newState.enabledMediaTypes.indexOf(action.mediaType);
      if (index >= 0) {
        newState.enabledMediaTypes = newState.enabledMediaTypes
          .slice(0, index)
          .concat(newState.enabledMediaTypes.slice(index + 1));
      }
      // If authenticator 2SV is turned off then security key 2SV needs to be turned off as well.
      if (action.mediaType === MediaType.Authenticator) {
        const securityKeyIndex = newState.enabledMediaTypes.indexOf(MediaType.SecurityKey);
        if (securityKeyIndex >= 0) {
          newState.enabledMediaTypes = newState.enabledMediaTypes
            .slice(0, securityKeyIndex)
            .concat(newState.enabledMediaTypes.slice(securityKeyIndex + 1));
        }
      }
      return newState;
    }

    case SecurityTabActionType.SET_RECOVERY_CODE_STATUS: {
      newState.recoveryCodeStatus = action.recoveryCodeStatus;
      return newState;
    }

    case SecurityTabActionType.SET_HAS_CONNECTED_XBOX_ACCOUNT: {
      newState.hasConnectedXboxAccount = action.hasConnectedXboxAccount;
      return newState;
    }

    case SecurityTabActionType.SET_HAS_CONNECTED_PLAYSTATION_ACCOUNT: {
      newState.hasConnectedPlaystationAccount = action.hasConnectedPlaystationAccount;
      return newState;
    }

    case SecurityTabActionType.SET_ROBUX_SPEND_FRICTION_STATUS: {
      newState.showRobuxSpendFriction = action.showRobuxSpendFriction;
      newState.robuxSpendFrictionMessage = action.robuxSpendFrictionMessage;
      newState.twoStepVerificationActionType = action.twoStepVerificationActionType;
      return newState;
    }

    default:
      return newState;
  }
};

export default securityTabStateReducer;
