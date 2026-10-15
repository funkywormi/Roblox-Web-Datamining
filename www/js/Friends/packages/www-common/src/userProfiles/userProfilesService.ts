import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

// get-profiles rejects requests over 200 ids.
export const USER_PROFILES_BATCH_SIZE = 200;

const optionalString = z.nullish(z.string());

const userProfileSchema = z.looseObject({
  userId: z.number(),
  names: z.nullish(
    z.looseObject({
      combinedName: optionalString,
      username: optionalString,
      displayName: optionalString,
      alias: optionalString,
      contactName: optionalString,
      platformName: optionalString,
      inExperienceName: optionalString,
    }),
  ),
});

const getProfilesResponseSchema = z.object({
  profileDetails: z.nullish(z.array(userProfileSchema)),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

const fetchBatch = async (
  userIds: readonly number[],
  fields: readonly string[],
): Promise<UserProfile[]> => {
  const url = Url.parse(environmentUrls.apiGatewayUrl)
    .getOrThrow()
    .withPath("/user-profile-api/v1/user/profiles/get-profiles");
  const result = await http.post(
    url,
    { userIds: [...userIds], fields: [...fields] },
    getProfilesResponseSchema,
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      retry: http.defaultBrowserRetryDelay,
    },
  );
  return result.getOrThrow().profileDetails ?? [];
};

/** Fetches the requested profile fields for `userIds`, keyed by user id. */
export const getUserProfiles = async (
  userIds: readonly number[],
  fields: readonly string[],
): Promise<Record<number, UserProfile>> => {
  const uniqueIds = [...new Set(userIds)];
  const batches: number[][] = [];
  for (let i = 0; i < uniqueIds.length; i += USER_PROFILES_BATCH_SIZE) {
    batches.push(uniqueIds.slice(i, i + USER_PROFILES_BATCH_SIZE));
  }
  const results = await Promise.all(batches.map(batch => fetchBatch(batch, fields)));

  const profiles: Record<number, UserProfile> = {};
  for (const profile of results.flat()) {
    profiles[profile.userId] = profile;
  }
  return profiles;
};
