import { useQuery } from "@tanstack/react-query";
import playButtonService from "../services/playButtonService";
import { TGuacPlayButtonUIResponse } from "../types/playButtonTypes";

const QUERY_KEY = "guacPlayButtonUI";
const STALE_TIME_MS = 60000;

const useGuacPlayButtonUI = () =>
  useQuery<TGuacPlayButtonUIResponse>({
    queryKey: [QUERY_KEY],
    queryFn: () => playButtonService.getGuacPlayButtonUI(),
    staleTime: STALE_TIME_MS,
  });

export default useGuacPlayButtonUI;
