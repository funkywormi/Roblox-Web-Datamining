import dataStores from "@rbx/core-scripts/data-store";
import { useQuery } from "@tanstack/react-query";

export type UseReferrerHandleResult = {
  /** `@username` of the referrer, or `undefined` when there is nobody safe to name. */
  handle: string | undefined;
  isLoading: boolean;
};

/**
 * Resolves the `@handle` behind the invited-by line.
 *
 * `getUser` rejects for anyone the users api withholds — deleted and banned accounts included —
 * so an unresolved lookup leaves the handle undefined and the sheet falls back to generic copy
 * rather than naming them. Retries are off so a withheld account settles on the first response.
 */
export const useReferrerHandle = (referrerUserId?: string): UseReferrerHandleResult => {
  // Anything but a positive integer means nobody to look up.
  const referrerId = Number.parseInt(referrerUserId ?? "", 10);
  const hasReferrer = Number.isFinite(referrerId) && referrerId > 0;

  const { data: referrer, isLoading } = useQuery({
    queryKey: ["plus-referrals", "referrer", referrerId],
    enabled: hasReferrer,
    retry: false,
    queryFn: () => dataStores.userDataStore.getUser(referrerId),
  });

  return {
    handle: referrer ? `@${referrer.name}` : undefined,
    isLoading: hasReferrer && isLoading,
  };
};

export default useReferrerHandle;
