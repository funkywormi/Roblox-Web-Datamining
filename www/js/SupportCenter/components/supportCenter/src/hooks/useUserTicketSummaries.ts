import { useInfiniteQuery } from "@tanstack/react-query";
import { getUserTickets } from "../services/creatorCommunicationService";
import { ListUserTicketSummariesResponse } from "../types";

export const userTicketSummariesQueryKey = ["user-ticket-summaries"];

const useUserTicketSummaries = () => {
  const query = useInfiniteQuery<ListUserTicketSummariesResponse>({
    retry: 1,
    queryKey: userTicketSummariesQueryKey,
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const result = await getUserTickets({
        cursor: pageParam,
      });

      return result;
    },
    getNextPageParam: (lastPage: ListUserTicketSummariesResponse): string | undefined => {
      if (!lastPage.nextPageToken) {
        // handles empty string
        return undefined;
      }
      return lastPage.nextPageToken;
    },
    refetchOnWindowFocus: false,
  });

  return query;
};

export default useUserTicketSummaries;
