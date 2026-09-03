import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import type { AxiosResponse } from "@rbx/core-scripts/http";
import type { HomepageReminderResponse } from "../utils/types";

const REMINDER_OF_NORMS_QUERY_KEY = "reminderOfNorms";
const REMINDER_OF_NORMS_URL = `${environmentUrls.userModerationApi}/v1/reminder`;

const fetchReminderData = (): Promise<AxiosResponse<HomepageReminderResponse>> => {
  const urlConfig: { url: string; withCredentials: boolean } = {
    url: REMINDER_OF_NORMS_URL,
    withCredentials: true,
  };
  return http.get(urlConfig);
};

/**
 * Fetches the Reminder of Norms data. On error, the UI renders nothing to not block
 * the user. The user would just see the dialog on the next load assuming the API is successful.
 */
const useReminderOfNormsQuery = (): HomepageReminderResponse | null => {
  const { data } = useQuery<HomepageReminderResponse | null>({
    queryKey: [REMINDER_OF_NORMS_QUERY_KEY],
    queryFn: async () => {
      try {
        const result = await fetchReminderData();
        return result.data;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  });

  return data ?? null;
};

export default useReminderOfNormsQuery;
