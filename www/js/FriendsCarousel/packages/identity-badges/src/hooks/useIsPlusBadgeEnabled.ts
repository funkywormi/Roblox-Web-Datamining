import { useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";

const PLUS_BADGE_GUAC_BEHAVIOUR = "web-plus-identity-badge";
const PLUS_BADGE_GUAC_FIELD = "plusIdentityBadgeEnabled";

type PlusBadgePolicy = {
  [PLUS_BADGE_GUAC_FIELD]?: boolean;
};

const isPlusBadgePolicy = (value: unknown): value is PlusBadgePolicy =>
  typeof value === "object" && value !== null;

export const useIsPlusBadgeEnabled = (): boolean => {
  const { data } = useQuery({
    queryKey: [`guac/${PLUS_BADGE_GUAC_BEHAVIOUR}`],
    queryFn: () => callBehaviour<unknown>(PLUS_BADGE_GUAC_BEHAVIOUR),
    staleTime: Infinity,
  });
  return isPlusBadgePolicy(data) && data[PLUS_BADGE_GUAC_FIELD] === true;
};

export default useIsPlusBadgeEnabled;
