import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { TSortIdMapping } from "../../common/types/bedev2Types";
import bedev2Services from "../../common/services/bedev2Services";

const SORT_ID_MAPPING_QUERY_KEY = "sortIdMapping";
const ERROR_EVENT_NAME = "sortIdMappingFetchError";

const useSortIdMapping = (): {
  sortIdMapping: TSortIdMapping | undefined;
} => {
  const logSortIdFetchError = () => {
    window.EventTracker?.fireEvent(ERROR_EVENT_NAME);
  };

  const { data: sortIdMapping } = useQuery({
    queryKey: [SORT_ID_MAPPING_QUERY_KEY],
    queryFn: () => bedev2Services.getSortIdMapping(),
    onError: logSortIdFetchError,
  });

  return useMemo(() => {
    return { sortIdMapping };
  }, [sortIdMapping]);
};

export default useSortIdMapping;
