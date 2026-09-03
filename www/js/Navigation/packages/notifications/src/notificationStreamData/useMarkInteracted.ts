import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import { httpService } from "core-utilities";
import { StreamNotification, markInteractedUrlConfig } from "./notificationStreamApi";
import { GET_RECENT_QUERY_KEY } from "./useGetRecentNotifications";
import { reportNotificationStreamError } from "./notificationStreamObservability";

export const useMarkInteracted = (): ReturnType<typeof useMutation<unknown, unknown, string>> => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string>({
    mutationFn: (eventId: string) => httpService.post(markInteractedUrlConfig, { eventId }),
    onMutate: (eventId: string) => {
      queryClient.setQueryData<InfiniteData<StreamNotification[]>>(GET_RECENT_QUERY_KEY, prev =>
        prev
          ? {
              ...prev,
              pages: prev.pages.map(page =>
                page.map(n => (n.id === eventId ? { ...n, isInteracted: true } : n)),
              ),
            }
          : prev,
      );
    },
    onError: error => reportNotificationStreamError("markInteracted", error),
  });
};

export default useMarkInteracted;
