import { Violation } from "@rbx/moderation-portal";
import { AppealsEventType } from "./eventTypes";
import { sendAppealsEvent } from "./sendAppealsEvent";

/**
 * Since this is all sent in URL search params, we need to limit ourselves for fields that can get large.
 * Generally, 2000 max length is a good rule of thumb for URL search params.
 */
const TRIM_LENGTH = 500;
export const trimField = (field: string | undefined): string | undefined => {
  if (!field) {
    return undefined;
  }
  if (field.length <= TRIM_LENGTH) {
    return field;
  }
  return `${field.substring(0, TRIM_LENGTH)}...`;
};

/**
 * On Violation List / Dashboard load
 */
export const sendViolationListPageLoadEvent = ({
  violationCount,
}: {
  violationCount: number;
}): void => {
  sendAppealsEvent(AppealsEventType.PageLoad, "ViolationList", {
    violationCount,
  });
};

/**
 * On Violation Details page load
 */
export const sendViolationPageLoadEvent = ({
  currentState,
  isAppealable,
  appealCount,
  lastViolationReason,
  violationType,
  isV2UI = false,
}: {
  currentState: Violation.state;
  isAppealable: boolean;
  appealCount: number;
  lastViolationReason: string;
  violationType: string;
  isV2UI?: boolean;
}): void => {
  sendAppealsEvent(AppealsEventType.PageLoad, "ViolationDetails", {
    state: currentState,
    isAppealable,
    appealCount,
    lastViolationReason,
    violationType,
    isV2UI,
  });
};

/**
 * On user requesting appeal
 */
export const sendRequestAppealEvent = ({
  prevAppealCount,
  msgLength,
  violationType,
  violationReason,
  isV2UI = false,
  optOutCommunication = false,
}: {
  prevAppealCount: number;
  msgLength: number;
  violationType: string;
  violationReason: string;
  isV2UI?: boolean;
  optOutCommunication?: boolean;
}): void => {
  sendAppealsEvent(AppealsEventType.RequestAppeal, "RequestAppeal", {
    prevAppealCount,
    msgLength,
    violationType,
    violationReason,
    isV2UI,
    optOutCommunication,
  });
};

/**
 * On the appeal-creation eligibility result becoming known (IDV funnel). Lets us
 * measure how many users land on an appealable violation that can appeal
 * directly (`true`) vs. those who must first complete IDV (`false`).
 */
export const sendAppealEligibilityEvent = ({
  isEligible,
  violationType,
  isV2UI = false,
}: {
  isEligible: boolean;
  violationType: string;
  isV2UI?: boolean;
}): void => {
  sendAppealsEvent(AppealsEventType.AppealEligibility, "ViolationDetails", {
    isEligible,
    violationType,
    isV2UI,
  });
};

/**
 * When the user clicks "Send Appeal" to begin the flow (IDV funnel "appeal
 * started" step). `requiresIdv` distinguishes the IDV pre-condition path from a
 * direct appeal.
 */
export const sendStartAppealEvent = ({
  isEligible,
  requiresIdv,
  prevAppealCount,
  violationType,
  violationReason,
  isV2UI = false,
}: {
  isEligible: boolean;
  requiresIdv: boolean;
  prevAppealCount: number;
  violationType: string;
  violationReason: string;
  isV2UI?: boolean;
}): void => {
  sendAppealsEvent(AppealsEventType.StartAppeal, "ViolationDetails", {
    isEligible,
    requiresIdv,
    prevAppealCount,
    violationType,
    violationReason,
    isV2UI,
  });
};

/**
 * Non-API errors such as runtime errors
 */
export const sendErrorEvent = ({
  errorType,
  errorMessage,
  errorStack,
  componentStack,
}: {
  errorType: string;
  errorMessage: string;
  errorStack: string;
  componentStack: string;
}): void => {
  sendAppealsEvent(AppealsEventType.Error, errorType, {
    errorMessage: trimField(errorMessage),
    errorStack: trimField(errorStack),
    componentStack: trimField(componentStack),
  });
};

/**
 * Sends API-related error events to data lake
 */
export const sendApiErrorEvent = ({
  urlOrKey,
  statusCode,
  message,
}: {
  urlOrKey: string;
  statusCode: number;
  message: string;
}): void => {
  sendAppealsEvent(AppealsEventType.ApiError, urlOrKey, {
    statusCode,
    message: trimField(message),
  });
};

/**
 * We have a bunch of enums etc, that are used as keys for translations.
 * There is some risk that those could get updated on the API side without us knowing.
 * So we can log this case.
 */
export const sendMissingTranslationEvent = ({
  key,
  params,
}: {
  key: string;
  params?: Record<string, unknown>;
}): void => {
  sendAppealsEvent(AppealsEventType.MissingTranslation, key, {
    value: params,
  });
};

/**
 * When we don't know how to handle a violation type
 */
export const sendUnknownViolationEvent = ({ violation }: { violation: Violation }): void => {
  sendAppealsEvent(AppealsEventType.UnknownViolation, violation.name, {
    details: trimField(JSON.stringify(violation.content)),
    evidence: trimField(JSON.stringify(violation.evidence)),
  });
};

/**
 * Sends violation validation-related error events to data lake. Differs from sendUnknownViolationEvent in that
 * sendUnknownViolationEvent is for unrecognized violations, and sendValidationErrorEvent triggers when the violation
 * is recognized as platform type but contains unrecognized elements.
 */
export const sendValidationErrorEvent = ({
  errorType,
  errorMessage,
}: {
  errorType: string;
  errorMessage: string;
}): void => {
  sendAppealsEvent(AppealsEventType.ValidationError, errorType, {
    errorMessage: trimField(errorMessage),
  });
};

/**
 * When user clicks "support - appeals something not shown"
 */
export const sendSupportClickEvent = (destination: string): void => {
  sendAppealsEvent(AppealsEventType.SupportClick, "ViolationList", { destination });
};
