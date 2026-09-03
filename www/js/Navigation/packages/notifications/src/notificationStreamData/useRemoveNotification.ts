import { useCallback } from "react";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { StreamNotification } from "./notificationStreamApi";
import { GET_RECENT_QUERY_KEY } from "./useGetRecentNotifications";

export const useRemoveNotification = (): ((notificationId: string) => void) => {
  const queryClient = useQueryClient();

  return useCallback(
    (notificationId: string) => {
      queryClient.setQueryData<InfiniteData<StreamNotification[]>>(GET_RECENT_QUERY_KEY, prev =>
        prev
          ? {
              ...prev,
              // The cache holds flat Sendr rows; bundles are re-derived per render by
              // groupSendrBundles, so dropping the last member drops the bundle row too.
              pages: prev.pages.map(page => page.filter(n => n.id !== notificationId)),
            }
          : prev,
      );
    },
    [queryClient],
  );
};

export default useRemoveNotification;
