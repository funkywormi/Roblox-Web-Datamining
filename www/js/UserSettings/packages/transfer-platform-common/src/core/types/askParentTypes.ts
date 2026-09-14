/**
 * The user-settings name for the Robux transfer limit pair.
 *
 * `@rbx/user-settings` owns the `UserSetting` enum this name belongs to, but
 * this package does not depend on it, and the wire carries the name as a plain
 * string either way.
 */
export const ROBUX_TRANSFER_LIMITS_SETTING = "robuxTransferLimits";

/** Consent type covering any request to change a user setting. */
export const UPDATE_USER_SETTING = "UpdateUserSetting";

export const PENDING_CONSENT_STATUS = "Pending";

/**
 * The AMP feature every child setting-change ask runs through — screentime,
 * content maturity and the fiat spend limit all use this one.
 */
export const SETTING_CHANGE_AMP_FEATURE = "CanChangeSetting";

/**
 * The AMP feature deciding whether this child may ask a parent about their
 * Robux transfer limits.
 *
 * It carries two things: the product rollout, and the age band that requires
 * verified parental consent. Neither says whether this child has anything to ask
 * about, so a granted answer only means something alongside a parent's cap
 * actually binding one of the windows.
 */
export const PARENT_MANAGED_LIMITS_AMP_FEATURE = "CanParentManageChildRobuxTransferLimits";

export type TFeatureAccessResponse = {
  access?: string | null;
};

/** AMP grants a feature outright; `Actionable` and `Denied` both mean "not yet". */
export const ACCESS_GRANTED = "Granted";

/** A request the child has sent that no parent has answered yet. */
export type TPendingAskParentRequest = {
  consentId: string;
};

type TConsent = {
  id: string;
  consentData?: Record<string, unknown> | null;
};

export type TGetConsentsResponse = {
  consents?: TConsent[] | null;
};

/** What the Robux tab needs in order to render the ask-parent row. */
export type TAskParentRequestControls = {
  /** Set while the child has an unanswered ask. */
  pendingRequest: TPendingAskParentRequest | null;
  onAsk: () => void;
  onCancel: () => void;
  /** A submit or cancel is in flight, so the controls take no further input. */
  isBusy: boolean;
  /** The last submit or cancel failed. */
  hasError: boolean;
};

/**
 * Finds the child's unanswered Robux-limit ask among their pending consents.
 *
 * parental-controls keys `consentData` by setting name, so membership is the
 * test rather than a comparison against the first key: a setting whose value
 * spans several keys, as the fiat spend limit does with its currency code,
 * would defeat that.
 */
export const findPendingAskParentRequest = (
  response: TGetConsentsResponse | null | undefined,
): TPendingAskParentRequest | null => {
  const consent = response?.consents?.find(
    ({ consentData }) => consentData != null && ROBUX_TRANSFER_LIMITS_SETTING in consentData,
  );

  return consent === undefined ? null : { consentId: consent.id };
};
