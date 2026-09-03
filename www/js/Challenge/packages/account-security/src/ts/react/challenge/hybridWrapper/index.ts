/* eslint-disable no-console */
/* eslint-disable no-case-declarations */
import Roblox, { EnvironmentUrls, Hybrid } from "Roblox";
import "../../../../css/challenge/captcha/captcha.scss";
import * as Option from "fp-ts/Option";
import * as boolean from "fp-ts/boolean";
import { pipe } from "fp-ts/lib/function";
import * as NewChallengeMiddleware from "@rbx/generic-challenges";
import * as NewChallengeTypes from "@rbx/generic-challenge-types";
import { withContinueMode } from "@rbx/generic-challenges";
import * as Captcha from "../captcha";
import * as DeviceIntegrity from "../deviceIntegrity";
import * as Biometric from "../biometric";
import * as CaptchaV2 from "../captchaV2";
import * as ForceActionRedirect from "../forceActionRedirect";
import * as Generic from "../generic";
import {
  ChallengeBaseProperties,
  ChallengeSpecificProperties,
  ChallengeType,
} from "../generic/interface";
import * as PrivateAccessToken from "../privateAccessToken";
import * as ProofOfSpace from "../proofOfSpace";
import * as ProofOfWork from "../proofOfWork";
import * as Rostile from "../rostile";
import * as SecurityQuestions from "../securityQuestions";
import * as Turnstile from "../turnstile";
import * as TwoStepVerification from "../twoStepVerification";
import { LOG_PREFIX } from "./app.config";
import { HybridTarget, RenderChallengeFromQueryParameters } from "./interface";
import {
  readQueryParametersBase,
  readQueryParametersForCaptcha,
  readQueryParametersForDeviceIntegrity,
  readQueryParametersForGenericChallenge,
  readQueryParametersForPrivateAccessToken,
  readQueryParametersForProofOfSpace,
  readQueryParametersForProofOfWork,
  readQueryParametersForRostile,
  readQueryParametersForSecurityQuestions,
  readQueryParametersForTwoStepVerification,
  readQueryParametersForBiometric,
  readQueryParametersForCaptchaV2,
  readQueryParametersForTurnstile,
} from "./query";
import { recordHybridEventMetric } from "./metrics";
import { recordHybridEventCounters } from "./counters";

const HYBRID_TARGET_KEY = "feature";
const CALLBACK_EVENT_NAME = "callbackInputChanged";
const CLASS_LIGHT_MODE = "light-theme";
const CLASS_DARK_MODE = "dark-theme";
const CHALLENGE_HYBRID_WEB_PAGE_LIFECYCLE_EVENT = "challengeHybridWebPageLifecycle";

// For when we fail @ parsing or something, for Generic challenges.
const unknownChallengeType = "unknown" as ChallengeType;

const getCurrentUrlParts = () => {
  const currentUrl = window.location.href;

  try {
    const parsedUrl = new URL(currentUrl);
    return {
      url: currentUrl,
      baseUrl: parsedUrl.origin,
      path: parsedUrl.pathname,
    };
  } catch (error) {
    console.error(LOG_PREFIX, "Failed to parse hybrid wrapper URL", error);
    return {
      url: currentUrl,
      baseUrl: "",
      path: "",
    };
  }
};

type CurrentUrlParts = ReturnType<typeof getCurrentUrlParts>;

const getQueryParameterValue = (parameterName: string): string => {
  try {
    return new URL(window.location.href).searchParams.get(parameterName) ?? "";
  } catch {
    return "";
  }
};

const getChallengeId = (): string => {
  return getQueryParameterValue("challenge-id") || getQueryParameterValue("generic-challenge-id");
};

const getLifecycleSuccess = (
  hybridTarget: HybridTarget,
  data: Record<string, unknown>,
): boolean => {
  if (hybridTarget === HybridTarget.CHALLENGE_INVALIDATED) {
    return false;
  }

  for (const key of ["parsed", "initialized", "displayed"]) {
    if (key in data && typeof data[key] === "boolean") {
      return data[key];
    }
  }

  return true;
};

type ChallengeHybridWebPageLifecycleEventOptions = {
  appType?: string;
  challengeId?: string;
  urlParts?: CurrentUrlParts;
};

const sendChallengeHybridWebPageLifecycleEvent = ({
  hybridTarget,
  challengeType,
  data,
  origin,
  options,
}: {
  hybridTarget: HybridTarget;
  challengeType: Generic.ChallengeType | NewChallengeTypes.ChallengeType;
  data: Record<string, unknown>;
  origin?: string;
  options?: ChallengeHybridWebPageLifecycleEventOptions;
}): void => {
  try {
    const { url, baseUrl, path } = options?.urlParts ?? getCurrentUrlParts();
    const success = getLifecycleSuccess(hybridTarget, data);
    const eventData: Record<string, unknown> = {
      url,
      baseUrl,
      path,
      referrerUrl: document.referrer,
      challengeType,
      challengeId: options?.challengeId ?? getChallengeId(),
      appType: (options?.appType ?? getQueryParameterValue("app-type")) || "unknown",
      origin: origin ?? getQueryParameterValue("origin"),
      hybridTarget,
      lifecycleEvent: hybridTarget,
      success,
    };

    if (!success) {
      eventData.errorName = `${hybridTarget}Failed`;
      eventData.errorMessage =
        typeof data.errorMessage === "string"
          ? data.errorMessage
          : `Hybrid lifecycle event ${hybridTarget} failed`;
    }

    Roblox.EventStream?.SendEventWithTarget(
      CHALLENGE_HYBRID_WEB_PAGE_LIFECYCLE_EVENT,
      hybridTarget,
      eventData,
      Roblox.EventStream.TargetTypes.WWW,
    );
  } catch (error) {
    console.error(LOG_PREFIX, "Failed to emit challenge hybrid web page lifecycle event", error);
  }
};

// Export some additional enums that are declared in the shared interface (they
// are also defined in the shared interface, but we need to expose them in the
// object hierarchy for the challenge component).
export { ChallengeType } from "../generic/interface";
export { HybridTarget } from "./interface";

const getHostname = () => {
  return EnvironmentUrls.domain.includes("sitetest") ? "robloxlabs.com" : "roblox.com";
};

// Small helper function for firing post messages to the parent window.
const dispatchPostMessageEvent = (
  type: HybridTarget,
  data: Record<string, unknown>,
  origin: string,
) => {
  if (window.parent) {
    // The origin parameter is the entire subdomain string therefore any existing subdomains
    // on our environment urls need to be removed.
    const targetOrigin = EnvironmentUrls.domain
      ? `https://${origin}.${getHostname()}`
      : "URL_NOT_FOUND";
    window.parent.postMessage(
      {
        genericChallengeResponse: {
          type,
          data,
        },
      },
      targetOrigin,
    );
  }
};

/**
 * Helper function for hybrid callbacks (including a fallback hybrid method for
 * Studio, which does not support the Roblox Hybrid library).
 */
const dispatchNavigateToFeatureHybridEvent = (
  challengeType: Generic.ChallengeType | NewChallengeTypes.ChallengeType,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  hybridTarget: HybridTarget,
  data: Record<string, unknown>,
  origin?: string,
  options?: ChallengeHybridWebPageLifecycleEventOptions,
): void => {
  recordHybridEventMetric({ hybridTarget, challengeType, data }); // Fire & forget a metric.
  recordHybridEventCounters({
    hybridTarget,
    challengeType,
    data,
    appType: (options?.appType ?? getQueryParameterValue("app-type")) || "unknown",
  }); // Fire & forget real-time counters.
  sendChallengeHybridWebPageLifecycleEvent({ hybridTarget, challengeType, data, origin, options });

  console.log(LOG_PREFIX, "Sending hybrid call:", hybridTarget, " to origin: ", origin);
  Hybrid?.Navigation?.navigateToFeature(
    {
      [HYBRID_TARGET_KEY]: hybridTarget,
      data,
    },
    () => console.log(LOG_PREFIX, "Sent hybrid call:", hybridTarget),
  );

  // Fallback hybrid method for Studio:
  const callbackElementId = hybridTargetToCallbackInputId[hybridTarget];
  const callbackElement = document.getElementById(callbackElementId) as HTMLInputElement;
  if (callbackElement !== null && callbackElement.tagName === "INPUT") {
    callbackElement.value = JSON.stringify(data);

    // Notify Studio with a custom HTML event.
    const callbackEvent = document.createEvent("HTMLEvents");
    callbackEvent.initEvent(CALLBACK_EVENT_NAME, false, false);
    callbackElement.dispatchEvent(callbackEvent);
  }

  // Handle window.postMessage transport protocol.
  try {
    if (origin) {
      dispatchPostMessageEvent(hybridTarget, data, origin);
    }
  } catch (error) {
    // Expected error cases here are target origin validation failures
    // and failure to dispatch messages.
    console.error(LOG_PREFIX, error);
  }
};

/**
 * Helper function for captcha hybrid challenges.
 */
const renderCaptchaChallengeFromQueryParameters = async (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): Promise<boolean> => {
  const queryParameters = readQueryParametersForCaptcha();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.CAPTCHA,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.CAPTCHA,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { actionType, dataExchangeBlob, unifiedCaptchaId } = queryParameters;
  const result = await Captcha.renderChallenge({
    containerId,
    actionType,
    appType,
    dataExchangeBlob,
    unifiedCaptchaId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.CAPTCHA,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.CAPTCHA,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for 2SV hybrid challenges.
 */
const renderTwoStepVerificationChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): boolean => {
  const queryParameters = readQueryParametersForTwoStepVerification();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.TWO_STEP_VERIFICATION,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const {
    userId,
    challengeId,
    actionType,
    allowRememberDevice,
    clientSupports2svRecovery,
    recoverySessionId,
  } = queryParameters;
  const result = TwoStepVerification.renderChallenge({
    containerId,
    userId,
    challengeId,
    actionType,
    appType,
    renderInline: true,
    // Page changes in the 2SV interface should trigger browser navigation so
    // the back button works correctly in Lua. In barista mode (web iframe),
    // HashRouter hash changes cause Firefox to reload the iframe, so we use
    // MemoryRouter instead.
    shouldModifyBrowserHistory: getQueryParameterValue("barista-mode") !== "true",
    shouldShowRememberDeviceCheckbox: allowRememberDevice,
    recoveryParameters: {
      clientSupports2svRecovery,
      recoverySessionId,
    },
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.TWO_STEP_VERIFICATION,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.TWO_STEP_VERIFICATION,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.TWO_STEP_VERIFICATION,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true },
  );
  return true;
};

/**
 * Helper function for security questions hybrid challenges.
 */
const renderSecurityQuestionsChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): boolean => {
  const queryParameters = readQueryParametersForSecurityQuestions();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.SECURITY_QUESTIONS,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.SECURITY_QUESTIONS,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { userId, sessionId } = queryParameters;
  const result = SecurityQuestions.renderChallenge({
    containerId,
    userId,
    sessionId,
    appType,
    renderInline: true,
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.SECURITY_QUESTIONS,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.SECURITY_QUESTIONS,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.SECURITY_QUESTIONS,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.SECURITY_QUESTIONS,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.SECURITY_QUESTIONS,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true },
  );
  return true;
};

/**
 * Helper function for private-access-token hybrid challenges.
 */
const renderPrivateAccessTokenChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  const queryParameters = readQueryParametersForPrivateAccessToken();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PRIVATE_ACCESS_TOKEN,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PRIVATE_ACCESS_TOKEN,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );
  const { challengeId } = queryParameters;

  const result = PrivateAccessToken.renderChallenge({
    containerId,
    challengeId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PRIVATE_ACCESS_TOKEN,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PRIVATE_ACCESS_TOKEN,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PRIVATE_ACCESS_TOKEN,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PRIVATE_ACCESS_TOKEN,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PRIVATE_ACCESS_TOKEN,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for proof-of-work hybrid challenges.
 */
const renderProofOfWorkChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  const queryParameters = readQueryParametersForProofOfWork();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PROOF_OF_WORK,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PROOF_OF_WORK,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { sessionId } = queryParameters;
  const result = ProofOfWork.renderChallenge({
    containerId,
    sessionId,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_WORK,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_WORK,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_WORK,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PROOF_OF_WORK,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PROOF_OF_WORK,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for rostile hybrid challenges.
 */
const renderRostileChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): boolean => {
  const queryParameters = readQueryParametersForRostile();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.ROSTILE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.ROSTILE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { challengeId, puzzleType } = queryParameters;
  const result = Rostile.renderChallenge({
    containerId,
    challengeId,
    puzzleType,
    appType,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.ROSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.ROSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.ROSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.ROSTILE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.ROSTILE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for CaptchaV2 hybrid challenges.
 */
const renderCaptchaV2ChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): boolean => {
  const queryParameters = readQueryParametersForCaptchaV2();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.CAPTCHA_V2,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.CAPTCHA_V2,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { challengeId } = queryParameters;
  const result = CaptchaV2.renderChallenge({
    containerId,
    challengeId,
    appType,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA_V2,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA_V2,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.CAPTCHA_V2,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.CAPTCHA_V2,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.CAPTCHA_V2,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for Turnstile hybrid challenges.
 */
const renderTurnstileChallengeFromQueryParameters = async (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): Promise<boolean> => {
  const queryParameters = readQueryParametersForTurnstile();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.TURNSTILE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.TURNSTILE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { challengeId } = queryParameters;
  const result = await Turnstile.renderChallenge({
    containerId,
    challengeId,
    appType,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.TURNSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.TURNSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.TURNSTILE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.TURNSTILE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.TURNSTILE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for device integrity hybrid challenges.
 */
const renderDeviceIntegrityChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  const queryParameters = readQueryParametersForDeviceIntegrity();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.DEVICE_INTEGRITY,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.DEVICE_INTEGRITY,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );
  const { challengeId, integrityType, requestHash } = queryParameters;

  const result = DeviceIntegrity.renderChallenge({
    containerId,
    challengeId,
    integrityType,
    requestHash,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.DEVICE_INTEGRITY,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.DEVICE_INTEGRITY,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.DEVICE_INTEGRITY,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.DEVICE_INTEGRITY,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.DEVICE_INTEGRITY,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

/**
 * Helper function for biometric hybrid challenges.
 */
const renderBiometricFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
): boolean => {
  const queryParameters = readQueryParametersForBiometric();

  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.BIOMETRIC,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.BIOMETRIC,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );
  const { challengeId, biometricType } = queryParameters;

  const result = Biometric.renderChallenge({
    containerId,
    challengeId,
    biometricType,
    appType,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.BIOMETRIC,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.BIOMETRIC,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.BIOMETRIC,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.BIOMETRIC,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.BIOMETRIC,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};
/**
 * Helper function for proof-of-space hybrid challenges.
 */
const renderProofOfSpaceChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  const queryParameters = readQueryParametersForProofOfSpace();
  // Handle hybrid callbacks for parse.
  if (queryParameters === null) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PROOF_OF_SPACE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PROOF_OF_SPACE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const { challengeId, artifacts } = queryParameters;
  const result = ProofOfSpace.renderChallenge({
    containerId,
    challengeId,
    artifacts,
    renderInline: true,
    onChallengeDisplayed: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_SPACE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
      ),
    onChallengeCompleted: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_SPACE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
      ),
    onChallengeInvalidated: data =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.PROOF_OF_SPACE,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
      ),
    onModalChallengeAbandoned: null,
  });
  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.PROOF_OF_SPACE,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.PROOF_OF_SPACE,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  return true;
};

const renderNewGenericChallengeFromQueryParameters = (
  challengeBaseProperties: ChallengeBaseProperties,
  challengeSpecificProperties: ChallengeSpecificProperties,
): Option.Option<Promise<boolean>> => {
  if (
    !NewChallengeMiddleware.Migrate.isSupportedByGrasshopper(
      challengeSpecificProperties.challengeType as unknown as NewChallengeTypes.ChallengeType,
    )
  ) {
    return Option.none;
  }

  const challengeBasePropertiesCasted = {
    ...challengeBaseProperties,
    legacyGenericRender: Generic.renderChallenge,
  } as unknown as NewChallengeTypes.ChallengeBaseProperties;
  const challengeSpecificPropertiesCasted =
    challengeSpecificProperties as unknown as NewChallengeTypes.ChallengeSpecificProperties;
  return Option.some(
    NewChallengeMiddleware.renderChallenge({
      challengeBaseProperties: {
        ...challengeBasePropertiesCasted,
        onChallengeCompleted: withContinueMode({
          challengeBaseProperties: challengeBasePropertiesCasted,
          challengeSpecificProperties: challengeSpecificPropertiesCasted,
        }),
      },
      challengeSpecificProperties: challengeSpecificPropertiesCasted,
    }),
  );
};
/**
 * Helper function for generic hybrid challenges.
 */
const renderGenericChallengeFromQueryParameters = async (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  appType: string,
  origin: string,
): Promise<boolean> => {
  const basePath = window.location.href.split("?")[0];
  const challengeSpecificProperties = readQueryParametersForGenericChallenge();
  // Handle hybrid callbacks for parse.
  if (challengeSpecificProperties === null) {
    dispatchNavigateToFeatureHybridEvent(
      unknownChallengeType,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    challengeSpecificProperties.challengeType,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const renderInline = origin.length === 0;
  // Unfortunately we rely on defined to handle dispatches to the hybrid event.
  const originPassed = renderInline ? undefined : origin;

  // We force the compiler to recognize the type with `const` here so that the later
  // match below has its type discriminants properly resolved (since we branch on a
  // runtime check the compiler flags that `renderInline` bool != true|false).
  const renderInlinedParameters = {
    renderInline: true as const,
    onModalChallengeAbandoned: null,
    onChallengeAbandoned: () =>
      dispatchNavigateToFeatureHybridEvent(
        challengeSpecificProperties.challengeType,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        { abandoned: true },
        originPassed,
      ),
  };
  const renderModalParameters = {
    renderInline: false as const,
    onModalChallengeAbandoned: () =>
      dispatchNavigateToFeatureHybridEvent(
        challengeSpecificProperties.challengeType,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        { abandoned: true },
        originPassed,
      ),
    onChallengeAbandoned: null,
  };
  const challengeParametersModalHandling = boolean.matchW(
    () => renderModalParameters,
    // If we render inline, modal abandoned is a meaningless callback.
    () => renderInlinedParameters,
  )(renderInline);

  const newChallengeMiddleware = {
    newRenderChallenge: NewChallengeMiddleware.renderChallenge,
    newParseChallenge: NewChallengeMiddleware.parseChallengeSpecificProperties,
  } as unknown as Pick<ChallengeBaseProperties, "newRenderChallenge" | "newParseChallenge">;
  const challengeBaseProperties: ChallengeBaseProperties = {
    containerId,
    appType,
    shouldModifyBrowserHistory: getQueryParameterValue("barista-mode") !== "true",
    onChallengeCompleted: data => {
      const urlParts = getCurrentUrlParts();
      // Attempt to clear hybrid webview url to prevent re-rendering on a potential
      // webview cache.
      window.history.replaceState(null, "", basePath);
      dispatchNavigateToFeatureHybridEvent(
        challengeSpecificProperties.challengeType,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_COMPLETED,
        data,
        originPassed,
        { appType, challengeId: challengeSpecificProperties.challengeId, urlParts },
      );
    },
    onChallengeInvalidated: data => {
      const urlParts = getCurrentUrlParts();
      window.history.replaceState(null, "", basePath);
      dispatchNavigateToFeatureHybridEvent(
        challengeSpecificProperties.challengeType,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        data,
        originPassed,
        { appType, challengeId: challengeSpecificProperties.challengeId, urlParts },
      );
    },
    onChallengeDisplayed: data => {
      dispatchNavigateToFeatureHybridEvent(
        challengeSpecificProperties.challengeType,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_DISPLAYED,
        data,
        originPassed,
      );
    },
    ...newChallengeMiddleware,
    ...challengeParametersModalHandling,
  };

  const maybeNewChallengeRendered = renderNewGenericChallengeFromQueryParameters(
    challengeBaseProperties,
    challengeSpecificProperties,
  );

  const result = await pipe(
    maybeNewChallengeRendered,
    Option.getOrElse(() =>
      Generic.renderChallenge({
        challengeBaseProperties,
        challengeSpecificProperties,
      }),
    ),
  );

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      challengeSpecificProperties.challengeType,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
      origin,
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    challengeSpecificProperties.challengeType,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
    origin,
  );
  return true;
};

/**
 * Helper function for force authenticator hybrid challenges.
 */
const renderForceAuthenticatorChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  // Force Authenticator has no custom query parameters.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_AUTHENTICATOR,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType:
      NewChallengeTypes.ForceActionRedirect.ForceActionRedirectChallengeType.ForceAuthenticator,
    renderInline: true,
    onModalChallengeAbandoned: null,
    onChallengeAbandoned: () =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.FORCE_AUTHENTICATOR,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        { abandoned: true },
      ),
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.FORCE_AUTHENTICATOR,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_AUTHENTICATOR,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_AUTHENTICATOR,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true },
  );
  return true;
};

/**
 * Helper function for force two-step verification hybrid challenges.
 */
const renderForceTwoStepVerificationChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  // Force Two-Step Verification has no custom query parameters.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType:
      NewChallengeTypes.ForceActionRedirect.ForceActionRedirectChallengeType
        .ForceTwoStepVerification,
    renderInline: true,
    onModalChallengeAbandoned: null,
    onChallengeAbandoned: () =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.FORCE_TWO_STEP_VERIFICATION,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        { abandoned: true },
      ),
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.FORCE_TWO_STEP_VERIFICATION,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.FORCE_TWO_STEP_VERIFICATION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true },
  );
  return true;
};

/**
 * Helper function for block session hybrid challenges.
 */
const renderBlockSessionChallengeFromQueryParameters = (
  containerId: string,
  hybridTargetToCallbackInputId: Record<HybridTarget, string>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _appType: string,
): boolean => {
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.BLOCK_SESSION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PARSED,
    { parsed: true },
  );

  const result = ForceActionRedirect.renderChallenge({
    containerId,
    forceActionRedirectChallengeType:
      NewChallengeTypes.ForceActionRedirect.ForceActionRedirectChallengeType.BlockSession,
    renderInline: true,
    onModalChallengeAbandoned: null,
    onChallengeAbandoned: () =>
      dispatchNavigateToFeatureHybridEvent(
        ChallengeType.BLOCK_SESSION,
        hybridTargetToCallbackInputId,
        HybridTarget.CHALLENGE_INVALIDATED,
        { abandoned: true },
      ),
  });

  // Handle hybrid callbacks for initialize.
  if (result === false) {
    dispatchNavigateToFeatureHybridEvent(
      ChallengeType.BLOCK_SESSION,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_INITIALIZED,
      { initialized: false },
    );
    return false;
  }
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.BLOCK_SESSION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_INITIALIZED,
    { initialized: true },
  );

  // Note that for other challenge types, this hybrid callback might be
  // triggered internally to the component.
  dispatchNavigateToFeatureHybridEvent(
    ChallengeType.BLOCK_SESSION,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_DISPLAYED,
    { displayed: true },
  );
  return true;
};

/**
 * Renders a hybrid challenge in a specific element based on the URL query
 * parameters.
 *
 * A hybrid challenge is one that calls back into a platform's native code by
 * following a designated calling convention.
 */
export const renderChallengeFromQueryParameters: RenderChallengeFromQueryParameters = async ({
  containerId,
  hybridTargetToCallbackInputId,
}) => {
  // Immediately send a hybrid event to confirm that the DOM has loaded without
  // any DOM or JavaScript errors.
  dispatchNavigateToFeatureHybridEvent(
    unknownChallengeType,
    hybridTargetToCallbackInputId,
    HybridTarget.CHALLENGE_PAGE_LOADED,
    { pageLoaded: true },
  );
  const queryParametersBase = readQueryParametersBase();
  // Handle hybrid callbacks for parse. The final parsed true callback will
  // happen in the individual challenge render functions, since each challenge
  // has some additional parameters it might parse.
  if (queryParametersBase === null) {
    dispatchNavigateToFeatureHybridEvent(
      unknownChallengeType,
      hybridTargetToCallbackInputId,
      HybridTarget.CHALLENGE_PARSED,
      { parsed: false },
    );
    return false;
  }

  // Our `web-frontend` modal is rendered in Barista via an injected `iframe`.
  // We want to set the `iframe` background as transparent so that our modal
  // appears to be rendering directly on the underlying Barista page.
  if (queryParametersBase.baristaMode) {
    document.body.style.backgroundColor = "transparent";
  }

  // Set dark or light mode theming.
  if (queryParametersBase.darkMode) {
    document.body.classList.remove(CLASS_LIGHT_MODE);
    document.body.classList.add(CLASS_DARK_MODE);
  } else {
    document.body.classList.remove(CLASS_DARK_MODE);
    document.body.classList.add(CLASS_LIGHT_MODE);
  }

  // Read more query parameters and render the specific challenge from the base
  // parameters.
  switch (queryParametersBase.challengeType) {
    case ChallengeType.CAPTCHA:
      return renderCaptchaChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.FORCE_AUTHENTICATOR:
      return renderForceAuthenticatorChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.FORCE_TWO_STEP_VERIFICATION:
      return renderForceTwoStepVerificationChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.TWO_STEP_VERIFICATION:
      return renderTwoStepVerificationChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.SECURITY_QUESTIONS:
      return renderSecurityQuestionsChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.PROOF_OF_WORK:
      return renderProofOfWorkChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.ROSTILE:
      return renderRostileChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.PRIVATE_ACCESS_TOKEN:
      return renderPrivateAccessTokenChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.DEVICE_INTEGRITY:
      return renderDeviceIntegrityChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.PROOF_OF_SPACE:
      return renderProofOfSpaceChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.PHONE_VERIFICATION:
      // Supported via generic challenge rendering.
      return false;
    case ChallengeType.EMAIL_VERIFICATION:
      // Supported via generic challenge rendering.
      return false;
    case ChallengeType.BLOCK_SESSION:
      return renderBlockSessionChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.BIOMETRIC:
      return renderBiometricFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.CAPTCHA_V2:
      return renderCaptchaV2ChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case ChallengeType.TURNSTILE:
      return renderTurnstileChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
      );
    case "generic":
      return renderGenericChallengeFromQueryParameters(
        containerId,
        hybridTargetToCallbackInputId,
        queryParametersBase.appType,
        queryParametersBase.origin,
      );
    default:
      // If we have handled all of the challenge types above, TypeScript will
      // infer `queryParametersBase` to have type `never` and the following
      // assignment should compile successfully.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const assertCodeIsUnreachable: never = queryParametersBase.challengeType;
      return false;
  }
};

export {
  renderNewGenericChallengeFromQueryParameters,
  renderGenericChallengeFromQueryParameters,
  dispatchNavigateToFeatureHybridEvent,
};
