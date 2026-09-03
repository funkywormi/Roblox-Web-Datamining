// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/*
 * Enum Types
 */

/**
 * The context in which biometric challenge is being called.
 */
export enum BiometricType {
  PersonaLivenessCheck = "PersonaLivenessCheck",
}

/**
 * An error code for a biometric challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0,
  NOT_SUPPORTED = 1,
  NOT_ENROLLED = 2,
  VERIFICATION_FAILED = 3,
  USER_CANCELLED = 4,
  TIMEOUT = 5,
}

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
  reason?: string;
  inquiryId?: string;
};

export type OnChallengeCompletedData = {
  biometricType: string;
  inquiryId?: string;
  reason?: string;
};

export type OnChallengeInvalidatedData = {
  errorCode: ErrorCode;
  errorMessage: string;
  reason?: string;
  inquiryId?: string;
};

/**
 * Internal payload attached to `SET_CHALLENGE_ABANDONED`. Surfaces only on
 * telemetry events; the public `onModalChallengeAbandoned` callback signature
 * is unchanged.
 */
export type OnChallengeAbandonedData = {
  reason?: string;
  inquiryId?: string;
};

export type OnChallengeDisplayedCallback = (data: OnChallengeDisplayedData) => unknown;

export type OnChallengeCompletedCallback = (data: OnChallengeCompletedData) => unknown;

export type OnChallengeInvalidatedCallback = (data: OnChallengeInvalidatedData) => unknown;

export type OnModalChallengeAbandonedCallback = (restoreModal: () => void) => unknown;

/*
 * Challenge Method
 */

type ChallengeParametersWithModal = {
  renderInline: false;
  onModalChallengeAbandoned: OnModalChallengeAbandonedCallback;
};

type ChallengeParametersWithNoModal = {
  renderInline: true;
  onModalChallengeAbandoned: null;
};

/**
 * The parameters required to render a biometric challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  biometricType: string;
  appType?: string;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => boolean;

/**
 * Renders a biometric challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
