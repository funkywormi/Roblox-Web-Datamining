import { useQuery } from "@tanstack/react-query";
import { getEventsForUniverseId, VirtualEvent } from "../services/services";

const queryKey = "getVirtualEventDetailsForUniverseId";

const useEventDetailsForUniverseId = (
  universeId: string,
): {
  eventDetails: VirtualEvent[] | undefined;
  hasError: boolean;
  isLoading: boolean;
} => {
  const {
    data: eventDetails,
    isError: hasError,
    isLoading,
  } = useQuery({
    queryKey: [queryKey, universeId],
    queryFn: () => getEventsForUniverseId(universeId),
  });

  return { eventDetails, hasError, isLoading };
};

export default useEventDetailsForUniverseId;
