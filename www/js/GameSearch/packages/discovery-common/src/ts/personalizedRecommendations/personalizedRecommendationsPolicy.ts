import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";

/** Guac app-policy field that turns the in-context entry points on for every surface. */
const PERMANENT_POLICY_FIELD = "showInContextPersonalizedRecommendationsSettings";

/** Guac app-policy fields for the per-surface rollout of the search entry points. */
export const PersonalizedRecommendationsPolicyField = {
  SearchOmnisearchExperiences:
    "showInContextPersonalizedRecommendationsSearchOmnisearchExperiences",
} as const;

export type PersonalizedRecommendationsPolicyField =
  (typeof PersonalizedRecommendationsPolicyField)[keyof typeof PersonalizedRecommendationsPolicyField];

type AppPolicyResponse =
  | Partial<
      Record<PersonalizedRecommendationsPolicyField | typeof PERMANENT_POLICY_FIELD, boolean | null>
    >
  | undefined;

/**
 * True only when both the permanent field and the surface's field are `true`; a missing field
 * fails closed. Keep the two terms separate: the per-surface one goes away once the rollout is done.
 */
export const isPersonalizedRecommendationsPolicyEnabled = (
  response: AppPolicyResponse,
  field: PersonalizedRecommendationsPolicyField,
): boolean => {
  const isPermanentEnabled = response?.[PERMANENT_POLICY_FIELD] === true;
  const isSurfaceEnabled = response?.[field] === true;
  return isPermanentEnabled && isSurfaceEnabled;
};

/**
 * Whether the surface's app-policy field enables the entry point. Only asks Guac once `enabled`,
 * so a page whose response carries no entry point data makes no extra request. The bundle is
 * cached for the page, and a failed request fails closed.
 */
export const usePersonalizedRecommendationsPolicy = (
  field: PersonalizedRecommendationsPolicyField,
  enabled: boolean,
): boolean => {
  const { data: isPolicyEnabled } = useQuery({
    queryKey: ["discovery-common/app-policy"],
    queryFn: () => callBehaviour<AppPolicyResponse>("app-policy"),
    select: response => isPersonalizedRecommendationsPolicyEnabled(response, field),
    enabled,
    staleTime: Infinity,
    retry: false,
  });

  return enabled && (isPolicyEnabled ?? false);
};
