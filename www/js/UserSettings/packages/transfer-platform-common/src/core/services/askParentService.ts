import * as http from "@rbx/core-scripts/http";
import { userId } from "@rbx/core-scripts/meta/user";
import { AccessManagementUpsellV2Service } from "@rbx/legacy-webapp-types/Roblox";
import { cancelConsentRequestUrl, consentsUrl } from "../constants/urlConstants";
import {
  findPendingAskParentRequest,
  PENDING_CONSENT_STATUS,
  ROBUX_TRANSFER_LIMITS_SETTING,
  SETTING_CHANGE_AMP_FEATURE,
  UPDATE_USER_SETTING,
  type TGetConsentsResponse,
  type TPendingAskParentRequest,
} from "../types/askParentTypes";

/**
 * Reads the child's own unanswered Robux-limit ask, or null when they have none.
 *
 * This package reads parental consents itself rather than reusing the hook
 * account-settings already exports: account-settings depends on this package to
 * host the Robux tab, so importing back would close a cycle.
 */
export const getPendingAskParentRequest = async (): Promise<TPendingAskParentRequest | null> => {
  const childUserId = userId();
  if (childUserId == null) {
    return null;
  }

  const { data } = await http.get<TGetConsentsResponse>(
    { url: consentsUrl, withCredentials: true },
    {
      childUserId,
      consentStatus: PENDING_CONSENT_STATUS,
      consentType: UPDATE_USER_SETTING,
    },
  );

  return findPendingAskParentRequest(data);
};

/**
 * Asks the child's parent to change their Robux transfer limits, through the
 * same AMP upsell screentime and content maturity use.
 *
 * AMP forwards `ampRecourseData` verbatim to `child-requests-api` as the
 * request details, so the wire payload is the one the design calls for: the
 * child names the setting and proposes no cap, and the parent supplies both
 * windows when they answer.
 *
 * The cap is `null` rather than an empty string, matching screentime and the
 * monthly spend limit. It also matches what the setting's own string converter
 * anticipates: it returns early on null, while any other value goes to
 * `RobuxTransferLimits.Parser.ParseJson`, which an empty string does not
 * satisfy. The eligibility check deliberately does not short-circuit on a
 * valueless ask for this setting, so that converter does run.
 *
 * Going through AMP rather than posting to `send-request-to-all-parents`
 * directly buys the parts of the flow that are not ours to reinvent: the email
 * hand-off for a child with no linked parent, the request-sent confirmation,
 * the floodcheck messaging, and the VPC v2 wizard when it is enabled.
 *
 * The promise resolves `false` whenever AMP hands off to a parent request, so
 * the result cannot tell us whether the ask was sent. Callers refetch the
 * pending read instead — the same thing screentime does.
 */
export const submitAskParentRequest = async (): Promise<void> => {
  await AccessManagementUpsellV2Service.startAccessManagementUpsell({
    featureName: SETTING_CHANGE_AMP_FEATURE,
    isAsyncCall: false,
    usePrologue: false,
    ampRecourseData: { [ROBUX_TRANSFER_LIMITS_SETTING]: null },
  });
};

export const cancelAskParentRequest = async (consentId: string): Promise<void> => {
  await http.post({ url: cancelConsentRequestUrl, withCredentials: true }, { consentId });
};
