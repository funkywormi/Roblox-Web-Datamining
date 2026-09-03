import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import { TPunishment } from "../utils/types";

/**
 * A basic API call that fetches the punishment data for the current user.
 *
 * API Definition:
 * https://sourcegraph.rbx.com/github.rbx.com/Roblox/behavior-intervention/-/blob/internal/controller/http_controller/get_not_approved.go?L166
 */
const usePunishmentData = (): UseQueryResult<TPunishment> => {
  const { httpGet, userModerationApiUrl } = useNotApprovedUIConfig();

  return useQuery<TPunishment>({
    queryKey: ["not-approved-data"],
    queryFn: () => httpGet<TPunishment>(`${userModerationApiUrl}/v1/not-approved`),
    /**
     * We don't anticipate the punishment data changing for a user dynamically at all so we can set the stale
     * time to Infinity to never refetch the data. The only time the data can change is when the user refreshes
     * the page.
     */
    staleTime: Infinity,
  });
};

export default usePunishmentData;
