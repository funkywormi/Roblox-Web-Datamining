import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { userId } from "@rbx/core-scripts/meta/user";
import * as http from "@rbx/core-scripts/http";
import { APPEAL_ELIGIBILITY_QUERY_KEY } from "./queryKeys";
import { getAppealEligibilityUrl } from "../shared/url";

/**
 * AMP configuration returned by the eligibility endpoint, used to launch the
 * Access Management (IDV) upsell wizard when the user must verify before they
 * can appeal.
 *
 * The eligibility endpoint returns only the appeals-specific feature name and
 * namespace. It does NOT return a Persona template hint — the appeals IDV
 * template is selected by the AMP upsell wizard based on the client-only
 * `wizardIntent` flag (AMP returns the standard `GovernmentId` recourse for this
 * flow).
 */
export interface AmpConfig {
  /** AMP feature name to pass to the upsell wizard as `featureName`. */
  featureName: string;
  /** AMP namespace to pass to the upsell wizard, e.g. `moderation_appeals/ModerationAppeals`. */
  namespace: string;
}

export interface AppealEligibilityResponse {
  /**
   * Whether the current user can appeal this violation directly.
   * - `true`: appeal directly (open the appeal modal, no extra requirement).
   * - `false`: the user must first complete a pre-condition (IDV) surfaced via
   *   the Access Management upsell wizard described by `ampConfig`.
   */
  isEligible: boolean;
  ampConfig?: AmpConfig;
}

export const getAppealEligibility = async (
  violationId: string,
): Promise<AppealEligibilityResponse> => {
  const req = await http.get<AppealEligibilityResponse>({
    url: getAppealEligibilityUrl(userId(), violationId),
    withCredentials: true,
  });

  return req.data;
};

/**
 * Query the appeal-creation eligibility for a single violation. Drives whether
 * the violation page shows a direct appeal form, an IDV pre-condition step, or
 * no appeal entry point at all.
 *
 * Pass `enabled: false` to skip the request entirely (e.g. for violations that
 * have no inline appeal entry point), in which case the query stays idle.
 */
export const useAppealEligibility = (
  violationId: string,
  { enabled = true }: { enabled?: boolean } = {},
): UseQueryResult<AppealEligibilityResponse> =>
  useQuery({
    queryKey: [APPEAL_ELIGIBILITY_QUERY_KEY, violationId],
    queryFn: () => getAppealEligibility(violationId),
    enabled,
  });
