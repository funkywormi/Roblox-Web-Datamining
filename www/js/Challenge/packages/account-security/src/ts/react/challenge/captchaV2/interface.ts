// This file contains the public interface types for this component. Since this
// component uses TS strict mode, which other TS components may not, we keep
// the types for the public interface separate in order to avoid compilation
// errors arising from the strict mode mismatch.

import { CaptchaMode } from "../../../common/request/types/captchaV2";

// Re-exported so consumers of the challenge can reference the mode enum without
// reaching into the request layer.
export { CaptchaMode };

/**
 * An error code for a CaptchaV2 challenge.
 */
export enum ErrorCode {
  UNKNOWN = 0,
  SESSION_NOT_FOUND = 1,
}

/*
 * Callback Types
 */

export type OnChallengeDisplayedData = {
  displayed: true;
};

/**
 * The data passed to the completion callback. The `redemptionToken` returned by
 * `v2/captcha` must be forwarded to GCS, which presents it to `RedeemCaptcha`
 * to redeem the now-verified session.
 */
export type OnChallengeCompletedData = {
  redemptionToken: string;
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
 * The parameters required to render a CaptchaV2 challenge.
 */
export type ChallengeParameters = {
  containerId: string;
  challengeId: string;
  appType?: string;
  /**
   * The optional captcha mode resolved by GCS. May be absent.
   */
  mode?: CaptchaMode;
  onChallengeDisplayed: OnChallengeDisplayedCallback;
  onChallengeCompleted: OnChallengeCompletedCallback;
  onChallengeInvalidated: OnChallengeInvalidatedCallback;
} & (ChallengeParametersWithModal | ChallengeParametersWithNoModal);

/**
 * The type of `renderChallenge`.
 */
export type RenderChallenge = (challengeParameters: ChallengeParameters) => boolean;

/**
 * Renders a CaptchaV2 challenge with the given parameters.
 */
export declare const renderChallenge: RenderChallenge;

/**
 * The type of `preloadSensor`.
 */
export type PreloadSensor = () => void;

/**
 * Warm up sensor for CaptchaV2 to make decision in async.
 */
export declare const preloadSensor: PreloadSensor;
