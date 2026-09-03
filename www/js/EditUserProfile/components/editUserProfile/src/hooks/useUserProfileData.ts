import { useCallback } from "react";
import { QueryObserverResult, useQuery } from "@tanstack/react-query";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useUserProfiles, UserProfileField } from "@rbx/user-profiles";
import { getDescriptionAsync } from "../services/userService";

type UserProfileData = {
  userId: number;
  displayName: string;
  username: string;
  description: string | undefined;
  refetchDescription: () => Promise<QueryObserverResult<string>>;
  refetchDisplayName: () => Promise<void>;
};

const FIVE_MIN_MS = 5 * 60 * 1000;

const useUserProfileData = (): UserProfileData => {
  const currentUser = authenticatedUser();
  const userId = currentUser?.id ?? 0;

  const { data: profileData, client } = useUserProfiles(userId ? [userId] : [], [
    UserProfileField.Names.DisplayName,
    UserProfileField.Names.Username,
  ]);

  const displayName = profileData?.[userId]?.names.displayName ?? "";
  const username = profileData?.[userId]?.names.username ?? "";

  const refetchDisplayName = useCallback(async () => {
    await client.refetchQueries({ include: "active" });
  }, [client]);

  const { data: description = undefined, refetch: refetchDescription } = useQuery<string>({
    queryKey: ["userDescription", userId],
    queryFn: getDescriptionAsync,
    enabled: Boolean(userId),
    staleTime: FIVE_MIN_MS,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  return {
    userId,
    displayName,
    username,
    description,
    refetchDescription,
    refetchDisplayName,
  };
};

export default useUserProfileData;
