// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

/**
 * An error code for a Turnstile challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0,
}

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
};

/**
 * The data passed to the completion callback. The `turnstileToken` produced by
 * the Turnstile widget is forwarded to GCS, which validates it server-side.
 */
export type OnChallengeCompletedData = {
  turnstileToken: string;
};

export type OnChallengeInvalidatedData = {
  errorCode: ErrorCode;
  errorMessage: string;
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
 * The parameters required to render a Turnstile challenge.
 *
 * Note that the site key is not a parameter: it is fetched from
 * `turnstile-service` inside `renderChallenge`.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  appType?: string;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => Promise<boolean>;

/**
 * Renders a Turnstile challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;
