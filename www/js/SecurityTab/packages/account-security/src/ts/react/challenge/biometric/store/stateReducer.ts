import { BiometricAction, BiometricActionType } from "./action";
import { BiometricState } from "./state";

/**
 * Reducer for biometric challenge state management.
 */
export const biometricStateReducer = (
  oldState: BiometricState,
  action: BiometricAction,
): BiometricState => {
  const newState = { ...oldState };
  switch (action.type) {
    case BiometricActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case BiometricActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case BiometricActionType.SET_CHALLENGE_ABANDONED:
      newState.onChallengeAbandonedData = action.onChallengeAbandonedData;
      return newState;
    default:
      return oldState;
  }
};

export default biometricStateReducer;
