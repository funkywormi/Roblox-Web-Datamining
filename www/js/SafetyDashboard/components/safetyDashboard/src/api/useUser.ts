import { UseQueryResult, useQuery } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import { USER_QUERY_KEY } from "./queryKeys";
import { getUserUrl } from "../shared/url";

interface User {
  name: string;
}

const getUser = async (userId: number): Promise<User> => {
  const req = await http.get<User>({
    url: getUserUrl(userId),
    withCredentials: true,
  });

  return req.data;
};

/**
 * Get a user's public info, such as their username.
 */
export const useUser = (
  userId: number,
  { enabled = true }: { enabled?: boolean } = {},
): UseQueryResult<User> =>
  useQuery({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: () => getUser(userId),
    enabled,
  });
