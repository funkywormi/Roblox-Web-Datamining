import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import { useRestrictionScope } from "../contexts/RestrictionScopeContext";
import { useUniversalFeatureRestrictionsConfig } from "../contexts/UniversalFeatureRestrictionsConfigContext";
import { isOverrideBackedAbuseVector } from "../treatments/dialog/restrictionDialogContent/restrictionDialogContentRegistry";
import type { ModerationDetail } from "../types/api";

type UseModerationDetailResult = Pick<
  UseQueryResult<ModerationDetail | null, Error>,
  "data" | "isLoading" | "isFetching" | "error"
>;

/**
 * Query key for a scoped abuse vector's moderation detail.
 */
export const moderationDetailQueryKey = (abuseVector: string): [string, string] => [
  "moderation-detail",
  abuseVector,
];

/**
 * Returns provided realtime moderation detail immediately, otherwise fetches it for the scoped
 * abuse vector.
 */
export const useModerationDetail = (
  providedModerationDetail?: ModerationDetail,
): UseModerationDetailResult => {
  const { api } = useUniversalFeatureRestrictionsConfig();
  const { abuseVector } = useRestrictionScope();

  const hasProvidedDetail = providedModerationDetail !== undefined;

  const query = useQuery<ModerationDetail | null, Error>({
    queryKey: moderationDetailQueryKey(abuseVector),
    queryFn: () => api.fetchModerationDetail(abuseVector),
    enabled: !hasProvidedDetail && !isOverrideBackedAbuseVector(abuseVector),
    /**
     * We don't know if a new mount has a new punishment (e.g. a user has a nudge
     * then gets immediately timed out), so we always refetch on mount.
     */
    refetchOnMount: "always",
  });

  if (hasProvidedDetail) {
    return {
      data: providedModerationDetail,
      isLoading: false,
      isFetching: false,
      error: null,
    };
  }

  return query;
};
