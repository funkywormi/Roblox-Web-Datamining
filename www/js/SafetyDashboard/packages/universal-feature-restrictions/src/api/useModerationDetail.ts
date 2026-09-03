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
 * Fetches the moderation detail for the scoped abuse vector.
 */
export const useModerationDetail = (): UseModerationDetailResult => {
  const { api } = useUniversalFeatureRestrictionsConfig();
  const { abuseVector } = useRestrictionScope();

  const { data, isLoading, isFetching, error } = useQuery<ModerationDetail | null, Error>({
    queryKey: moderationDetailQueryKey(abuseVector),
    queryFn: () => api.fetchModerationDetail(abuseVector),
    enabled: !isOverrideBackedAbuseVector(abuseVector),
    /**
     * We don't know if a new mount has a new punishment (e.g. a user has a nudge
     * then gets immediately timed out), so we always refetch on mount.
     */
    refetchOnMount: "always",
  });

  return { data, isLoading, isFetching, error };
};
