import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";
import type { TPresenceResponse } from "../types/api";

const PRESENCE_BATCH_SIZE = 100;

export const getUserPresences = async (userIds: number[]): Promise<TPresenceResponse> => {
  if (userIds.length === 0) {
    return { userPresences: [] };
  }

  const batches: number[][] = [];
  for (let i = 0; i < userIds.length; i += PRESENCE_BATCH_SIZE) {
    batches.push(userIds.slice(i, i + PRESENCE_BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map(async batch => {
      const body = await chatHttpTransport.post<TPresenceResponse>(
        {
          url: `${environmentUrls.presenceApi}/v1/presence/users`,
          withCredentials: true,
        },
        { userIds: batch },
      );
      return body;
    }),
  );

  return {
    userPresences: results.flatMap(result => result.userPresences),
  };
};
