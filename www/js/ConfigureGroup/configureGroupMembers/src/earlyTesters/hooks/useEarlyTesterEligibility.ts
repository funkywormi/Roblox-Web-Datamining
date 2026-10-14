import { useQuery } from '@tanstack/react-query';
import type { PlaytesterEligibility } from '../../clients/developApi';
import developApiClient from '../../clients/developApi';

export const getPlaytesterEligibilityQueryKey = (
  universeId: string,
  userIds: readonly number[],
) => ['developApi_playtesterEligibility', universeId, userIds];

const EMPTY_ELIGIBILITY: ReadonlyMap<number, boolean> = new Map();

const toEligibilityMap = (results: PlaytesterEligibility[]): ReadonlyMap<number, boolean> => {
  const eligibility = new Map<number, boolean>();
  for (const { userId, isEligible } of results) {
    if (userId != null && isEligible != null) {
      eligibility.set(userId, isEligible);
    }
  }
  return eligibility;
};

/**
 * Checks whether the given group members can be early testers on this universe. Assigning a
 * group role doesn't run the early tester safety check, so the picker has to.
 *
 * Keeps the previous results while a changed list is checked, so badges don't flicker. Fails
 * open: ids whose check failed or hasn't returned yet are absent from the map, so callers should
 * treat only `false` as ineligible.
 */
export default function useEarlyTesterEligibility(
  universeId: string,
  userIds: readonly number[],
  enabled: boolean,
): ReadonlyMap<number, boolean> {
  const sortedUserIds = Array.from(new Set(userIds)).sort((a, b) => a - b);
  const { data } = useQuery({
    queryKey: getPlaytesterEligibilityQueryKey(universeId, sortedUserIds),
    queryFn: () => developApiClient.getPlaytesterEligibility(Number(universeId), sortedUserIds),
    select: toEligibilityMap,
    enabled: enabled && sortedUserIds.length > 0,
    staleTime: Infinity,
    // Only carry results over within the same universe.
    placeholderData: (previousData, previousQuery) =>
      previousQuery?.queryKey[1] === universeId ? previousData : undefined,
  });
  return data ?? EMPTY_ELIGIBILITY;
}
