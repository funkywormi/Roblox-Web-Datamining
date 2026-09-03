/* eslint-disable camelcase */
import environmentUrls from "@rbx/environment-urls";
import { userId } from "@rbx/core-scripts/meta/user";
import * as http from "@rbx/core-scripts/http";
import { Violation, Appeal, ListViolationsResponse, Bundle, Asset } from "@rbx/moderation-portal";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import {
  isAssetContent,
  isAvatarContent,
  isBundleContent,
  isLookContent,
  isUserProfileContent,
  isChatContent,
  isPlatformEvidence,
  isPlatformElementValid,
  isLimited,
} from "./types";
import {
  ViolationItemI18n,
  getTranslationKeysForViolation,
  getAppealStatusI18n,
} from "./violationI18n";
import { getVisibleAbuseTypes } from "./getFilteredAbuseTypes";

const baseApiV1 = `${environmentUrls.apiGatewayUrl}/moderation-appeal-service/v1`;
const baseApiV2 = `${environmentUrls.apiGatewayUrl}/moderation-appeal-service/v2`;

const INVALID_VIOLATION_ERROR_NAME = "InvalidViolationError";
export class InvalidViolationError extends Error {
  constructor() {
    super("Got malformed or unsupported individual violation");
    this.name = INVALID_VIOLATION_ERROR_NAME;
    // Set the prototype explicitly, since we're compiling to es5
    Object.setPrototypeOf(this, InvalidViolationError.prototype);
  }
}

/**
 * This is the interface for an error from fetching from the violations API.
 */
interface HTTPError {
  status: number;
}
export const isHTTPError = (error: unknown): error is HTTPError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  );
};

/**
 * The below values are used to test correct behavior for 404. Due to
 * MockedHttpService limitations, there is no common way to check for 404
 * between tests and real life - this provides a workaround.
 */
export const MOCK_404_ERROR_DATA = "this-is-a-mock-404-error";
export const isMock404 = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    error.data === MOCK_404_ERROR_DATA
  );
};

// Re-export for convenience - these namespaces contain both types and enum values
export { Violation, Appeal, Bundle, Asset };
export type { ListViolationsResponse };

/**
 * How the user can appeal this violation, if at all. Components downstream of
 * `enrichViolation` should branch on this discriminator instead of recomputing
 * the underlying boolean tangle of `appealable`/`isLimited`/`expired`/`state`.
 *
 * - `inline`: render the in-page Send Appeal button + modal flow.
 * - `support`: appeal must go through the support form (used for LIMITED
 *   violations whose appeal window is still open and which are not INACTIVE).
 * - `none`: no appeal entry point should be shown.
 */
export type AppealMethod = "inline" | "support" | "none";

/** We'll enrich the violation a bit to simplify logic in various components */
export interface EnrichedViolation extends Violation {
  contentTypeI18n: string;
  contentTypeI18nLower: string;
  expired: boolean;
  appealable: boolean;
  isLimited: boolean;
  /** True if `abuse_type_keys` contains at least one entry that the UI would render. */
  hasVisibleAbuseTypes: boolean;
  /**
   * Convenience flag for the LIMITED case where there is genuinely nothing for
   * the WhatHappened/ActivityReviewed sections to show: no abuse types, no
   * moderator note, and no structured content/evidence (i.e. `isLimited`).
   */
  isLimitedWithoutDetails: boolean;
  appealMethod: AppealMethod;
  /**
   * Translated status line derived from the violation's state (e.g. appeal
   * denied/accepted, inactive, appeal unavailable). `undefined` when the state
   * has no status line to show (e.g. INITIATED, APPEAL_ACTIVE).
   */
  appealStatusI18n?: string;
  i18n: ViolationItemI18n;
}

export const getViolations = async ({
  page_token,
  page_size = 100,
}: {
  page_token?: string;
  page_size?: number;
}): Promise<ListViolationsResponse> => {
  const req = await http.get<ListViolationsResponse>(
    {
      url: `${baseApiV1}/users/${userId()}/violations`,
      withCredentials: true,
    },
    {
      page_size,
      page_token,
    },
  );
  return req.data;
};

export const getViolation = async (violationId: string): Promise<Violation> => {
  const req = await http.get<Violation>({
    url: `${baseApiV2}/users/${userId()}/violations/${violationId}`,
    withCredentials: true,
  });
  return req.data;
};

export const enrichViolation = (
  violation: Violation,
  translationResource: WithTranslationsProps,
): EnrichedViolation => {
  const expired = new Date(violation.appeal_by_time).getTime() < Date.now();
  const appealable =
    violation.remaining_appeal_attempts > 0 &&
    (violation.state === Violation.state.VIOLATION_STATE_INITIATED ||
      violation.state === Violation.state.VIOLATION_STATE_APPEAL_DENIED) &&
    !expired;

  const translation = getTranslationKeysForViolation(violation, translationResource);
  const hasVisibleAbuseTypes = getVisibleAbuseTypes(violation.abuse_type_keys).length > 0;

  const limited = isLimited(violation);
  const isLimitedWithoutDetails = limited && !violation.user_note && !hasVisibleAbuseTypes;
  const isInactive = violation.state === Violation.state.VIOLATION_STATE_INACTIVE;

  let appealMethod: AppealMethod = "none";
  if (appealable && !limited) {
    appealMethod = "inline";
  } else if (limited && !expired && !isInactive) {
    appealMethod = "support";
  }

  return {
    ...violation,
    appeals: violation.appeals,
    contentTypeI18n: translation.contentType,
    contentTypeI18nLower: translation.contentTypeLower,
    appealable,
    expired,
    isLimited: limited,
    hasVisibleAbuseTypes,
    isLimitedWithoutDetails,
    appealMethod,
    appealStatusI18n: getAppealStatusI18n(violation, translationResource),
    i18n: translation,
  };
};

let shouldSkipValidation = (() => {
  try {
    return sessionStorage.getItem("mp:violation-validation") === "skip";
  } catch {
    return false;
  }
})();

/**
 * ** FOR TESTING PURPOSES ONLY **
 * Since we'll want to write tests for non-whitelisted violations during development,
 * we'll need to skip the validation.
 */
export const testingSetSkipValidation = (skip: boolean): void => {
  shouldSkipValidation = skip;
};

/**
 * To be conservative, we'll allow-list the types we know we can handle.
 */
const supportedAssetTypes: Record<Asset["asset_type"], boolean> = {
  [Asset.asset_type.ASSET_TYPE_AUDIO]: true,
  [Asset.asset_type.ASSET_TYPE_IMAGE]: true,
  [Asset.asset_type.ASSET_TYPE_3D_ACCESSORY]: true,
  [Asset.asset_type.ASSET_TYPE_EXPERIENCE]: true,
  [Asset.asset_type.ASSET_TYPE_MESH]: true,
  [Asset.asset_type.ASSET_TYPE_MODEL]: true,
  [Asset.asset_type.ASSET_TYPE_PLUGIN]: true,
  [Asset.asset_type.ASSET_TYPE_UNSPECIFIED]: true,
};

/**
 * To be careful, we'll limit the violations to known types
 * To skip the check, set `sessionStorage.setItem('mp:violation-validation', 'skip')`.
 */
export const isSupportedViolation = (violation: Violation): boolean => {
  return (
    shouldSkipValidation ||
    isLimited(violation) ||
    isPlatformEvidence(violation.evidence) ||
    (isAssetContent(violation.content) && supportedAssetTypes[violation.content.asset_type]) ||
    isBundleContent(violation.content) ||
    isAvatarContent(violation.content) ||
    isUserProfileContent(violation.content) ||
    isLookContent(violation.content) ||
    isChatContent(violation.content)
  );
};

/**
 * Drop invalid platform evidence elements rather than failing the whole violation.
 * If none survive, clear `evidence` entirely so the violation collapses to LIMITED
 * (an empty `elements` array would still pass `isValidatedPlatformEvidence`).
 */
export const filterOutInvalidEvidence = (violation: Violation): Violation => {
  const violationCopy: Violation = { ...violation };

  if (isPlatformEvidence(violationCopy.evidence)) {
    const filteredElements = violationCopy.evidence.elements.filter(element =>
      isPlatformElementValid(element),
    );

    violationCopy.evidence =
      filteredElements.length > 0
        ? { ...violationCopy.evidence, elements: filteredElements }
        : undefined;
  }

  return violationCopy;
};

/**
 * Our current API is unique in that it might not return a full page even when
 * there are more results. So theoretically, we could could only get a fraction
 * of what we asked for which would be bad UX (e.g. showing the user an empty
 * page or very few items on load). We tackle this in two ways:
 * 1. We ask for more than page size to begin with so that we only need to make
 *    one round trip in most cases (hopefully).
 * 2. If our padded page size is not enough the get the count we need, then we
 *    call the API repeatedly until we get the count we want.
 *
 * The slight downside of this is that the actual result count will vary between
 * users and you can get more fetched than we asked for. But this is better than
 * getting less than we asked for.
 */
export const fetchAtLeastXViolations = async ({
  count,
  page_token,
}: {
  count: number;
  page_token?: string;
}) => {
  /**
   * Used to determine how much to increase the page size by.
   * Arbitrary number.
   * Ideally set so that we in 95% of cases get enough violations to satisfy `count`
   * in one round trip.
   * */
  const extraFactor = 1.2;
  // It's possible we could reduce page size for multiple requests to match
  // what we need to get close to the count we want, but not sure if the API
  // is happy with changing page size when using page tokens.
  /** Our padded page size. Hopefully enough to get us at least `count` results back at the first try) */
  const pageSize = Math.round(count * extraFactor);
  const collectedViolations: Violation[] = [];
  let currentPageToken: string | undefined = page_token;

  while (collectedViolations.length < count) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await getViolations({ page_token: currentPageToken, page_size: pageSize });
    const { next_page_token, violations } = resp;

    collectedViolations.push(...violations);
    currentPageToken = next_page_token;

    if (!currentPageToken) {
      break;
    }
  }
  return { violations: collectedViolations, next_page_token: currentPageToken };
};
