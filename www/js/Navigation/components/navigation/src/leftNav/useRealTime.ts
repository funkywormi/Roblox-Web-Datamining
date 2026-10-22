import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import realTime from "@rbx/core-scripts/realtime";

export const useRealTime = ({
  event,
  queryKey,
  queryClient,
}: {
  event: string;
  queryKey: string[];
  queryClient: QueryClient;
}) => {
  useEffect(() => {
    const client = realTime.GetClient();
    const callback = () =>
      queryClient.invalidateQueries({
        queryKey,
      });
    client.Subscribe(event, callback);
    return () => {
      client.Unsubscribe(event, callback);
    };
  }, [event, queryClient, queryKey]);
};
