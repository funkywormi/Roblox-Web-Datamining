import * as z from "zod/mini";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import { PLUS_PROFILE_FIELD } from "../constants";

export type PlusStatusByUserId = Record<number, boolean>;

const getProfilesResponseSchema = z.object({
  profileDetails: z.nullish(
    z.array(
      z.looseObject({
        userId: z.number(),
        hasRobloxSubscription: z.nullish(z.boolean()),
      }),
    ),
  ),
});

export const fetchPlusStatusForUsers = async (
  userIds: readonly number[],
): Promise<PlusStatusByUserId> => {
  const dedupedUserIds = [...new Set(userIds)];
  if (dedupedUserIds.length === 0) {
    return {};
  }

  const url = Url.parse(environmentUrls.apiGatewayUrl)
    .getOrThrow()
    .withPath("/user-profile-api/v1/user/profiles/get-profiles");
  const response = await http.post(
    url,
    { userIds: dedupedUserIds, fields: [PLUS_PROFILE_FIELD] },
    getProfilesResponseSchema,
    {
      credentials: "include",
      headers: { Accept: "application/json" },
      retry: http.defaultBrowserRetryDelay,
    },
  );

  const result: PlusStatusByUserId = {};
  for (const row of response.getOrThrow().profileDetails ?? []) {
    result[row.userId] = row.hasRobloxSubscription === true;
  }
  return result;
};
