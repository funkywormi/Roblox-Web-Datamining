import { useQuery } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import type { AccountStandingResponse } from "../types/api";
import { ACCOUNT_STANDING_URL } from "../shared/url";
import { ACCOUNT_STANDING_QUERY_KEY } from "./queryKeys";

/**
 * Fetches the user's account status and also information about all of the user's current
 * active feature restrictions.
 */
const useAccountStanding = () => {
  return useQuery<AccountStandingResponse, Error>({
    queryKey: [ACCOUNT_STANDING_QUERY_KEY],
    queryFn: async () => {
      const response = await http.get<AccountStandingResponse>({
        url: ACCOUNT_STANDING_URL,
        withCredentials: true,
      });

      return response.data;
    },
  });
};

export default useAccountStanding;
