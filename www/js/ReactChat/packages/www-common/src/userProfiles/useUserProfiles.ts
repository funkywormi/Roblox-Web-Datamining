import { useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { batchQuery } from "@rbx/core-lib/promise";
import { getUserProfiles, USER_PROFILES_BATCH_SIZE, type UserProfile } from "./userProfilesService";

const DEFAULT_STALE_TIME = 5 * 60 * 1000;
const BATCH_DELAY_MS = 10;

const normalizeFields = (fields: readonly string[]): string[] => [...new Set(fields)].sort();

export const userProfilesQueryKeys = {
  all: () => ["userProfiles"] as const,
  fields: (fields: readonly string[]) =>
    [...userProfilesQueryKeys.all(), normalizeFields(fields).join(",")] as const,
  user: (fields: readonly string[], userId: number) =>
    [...userProfilesQueryKeys.fields(fields), userId] as const,
};

// One batcher per field set, so ids requested in the same tick (by any caller) share a request.
const batchers = new Map<string, (userId: number) => Promise<UserProfile>>();

const fetchUserProfile = (fields: readonly string[], userId: number): Promise<UserProfile> => {
  const normalized = normalizeFields(fields);
  const key = normalized.join(",");
  let batcher = batchers.get(key);
  if (batcher == null) {
    batcher = batchQuery(
      { delay: BATCH_DELAY_MS, maxSize: USER_PROFILES_BATCH_SIZE },
      (userIds: number[]) => getUserProfiles(userIds, normalized),
      (profiles, id: number): UserProfile => profiles[id] ?? { userId: id },
    );
    batchers.set(key, batcher);
  }
  return batcher(userId);
};

export type UseUserProfilesOptions = {
  enabled?: boolean;
  staleTime?: number;
};

export type UseUserProfilesResult = {
  data: Record<number, UserProfile>;
  isLoading: boolean;
};

export const useUserProfiles = (
  userIds: readonly number[],
  fields: readonly string[],
  { enabled = true, staleTime = DEFAULT_STALE_TIME }: UseUserProfilesOptions = {},
): UseUserProfilesResult => {
  const uniqueIds = useMemo(() => [...new Set(userIds)], [userIds]);

  const results = useQueries({
    queries: uniqueIds.map(userId => ({
      queryKey: userProfilesQueryKeys.user(fields, userId),
      queryFn: () => fetchUserProfile(fields, userId),
      enabled,
      staleTime,
    })),
  });

  // Keep `data` referentially stable while every per-id entry is unchanged.
  const profiles = results.map(result => result.data);
  const cache = useRef<{
    profiles: (UserProfile | undefined)[];
    data: Record<number, UserProfile>;
  } | null>(null);
  if (
    cache.current?.profiles.length !== profiles.length ||
    cache.current.profiles.some((profile, i) => profile !== profiles[i])
  ) {
    const data: Record<number, UserProfile> = {};
    profiles.forEach(profile => {
      if (profile != null) {
        data[profile.userId] = profile;
      }
    });
    cache.current = { profiles, data };
  }

  // Not `isLoading`: its meaning differs between react-query v4 and v5.
  const isLoading =
    enabled && results.some(result => result.data === undefined && result.status !== "error");

  return { data: cache.current.data, isLoading };
};
