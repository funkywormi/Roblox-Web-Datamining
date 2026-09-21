import * as http from "@rbx/core-scripts/http";
import { apiSet } from "../core/constants/services";

type UsersByUsernameResponse = {
  data: { requestedUsername: string }[];
};

/**
 * Resolves a username against users-api, which matches former usernames as well as current
 * ones. That is the whole point: someone renamed by moderation to `roblox_user_{userId}` can
 * still file a ticket under the name they recognise. Banned accounts are included because
 * they need support too.
 *
 * The response also carries the account's id, display name, and current name. This returns
 * only whether a match exists so none of that reaches component state, Sentry breadcrumbs,
 * or a HAR capture.
 */
const lookupUsername = async (username: string): Promise<boolean> => {
  const { data } = await http.post<UsersByUsernameResponse>(apiSet.validateUsername, {
    usernames: [username],
    excludeBannedUsers: false,
  });

  return data.data.length > 0;
};

export default lookupUsername;
