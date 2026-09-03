import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBadgeByIdAsync } from "../services/playerBadgesService";

type FetchedBadgeDetails = {
  name: string;
};

type FetchBadgeByIdResult = {
  badge: FetchedBadgeDetails | null;
  isLoading: boolean;
};

const useFetchBadgeById = (badgeId: number): FetchBadgeByIdResult => {
  const { data, isLoading } = useQuery({
    queryKey: ["fetchBadgeById", badgeId],
    enabled: Boolean(badgeId),
    queryFn: async () => {
      const badge = await fetchBadgeByIdAsync(badgeId);
      return {
        name: badge.displayName || badge.name,
      };
    },
  });

  return useMemo(
    () => ({
      badge: data ?? null,
      isLoading,
    }),
    [data, isLoading],
  );
};

export default useFetchBadgeById;
