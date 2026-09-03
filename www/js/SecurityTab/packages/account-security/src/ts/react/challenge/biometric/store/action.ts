import {
  OnChallengeAbandonedData,
  OnChallengeCompletedData,
  OnChallengeInvalidatedData,
} from "../interface";
/**
 * Action types for biometric challenge state management.
 */
export enum BiometricActionType {
  SET_CHALLENGE_COMPLETED = "SET_CHALLENGE_COMPLETED",
  SET_CHALLENGE_INVALIDATED = "SET_CHALLENGE_INVALIDATED",
  SET_CHALLENGE_ABANDONED = "SET_CHALLENGE_ABANDONED",
}

/**
 * Action interfaces for biometric challenge.
 */
export type BiometricAction =
  | {
      type: BiometricActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: BiometricActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: BiometricActionType.SET_CHALLENGE_ABANDONED;
      onChallengeAbandonedData: OnChallengeAbandonedData;
    };
