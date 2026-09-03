import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";

export const IXP_LAYER_NAME = "UserSafety.NotApprovedPage.UserID";

export interface IxpConfig {
  FFlagEnableSafetyDashboard?: boolean;
}

interface UseNotApprovedPageIxpProps {
  enabled: boolean;
}

/**
 * The hook that fetches IXP data for the current user. Since we don't expect the IXP data to change
 * frequently, we can cache it indefinitely. The API returns the parameters for every experiment in the
 * layer, so we can use this hook to fetch all the IXP data for the current user.
 */
const useNotApprovedPageIxp = ({
  enabled,
}: UseNotApprovedPageIxpProps): UseQueryResult<IxpConfig> => {
  const { ixp } = useNotApprovedUIConfig();

  return useQuery({
    queryKey: [`ixp/${IXP_LAYER_NAME}`],
    queryFn: async () => {
      if (!ixp) return {};
      try {
        return await ixp.fetchLayer(IXP_LAYER_NAME);
      } catch {
        return {};
      }
    },
    // IXP data shouldn't change frequently so we can cache it indefinitely
    staleTime: Infinity,
    enabled: enabled && Boolean(ixp),
  });
};

export default useNotApprovedPageIxp;
