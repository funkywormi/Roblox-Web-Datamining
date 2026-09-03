import { useQuery, UseQueryResult } from '@tanstack/react-query';
import ExperimentationService from '@rbx/experimentation';

export const IXP_LAYER_NAME = 'UserSafety.SafetyDashboard.UserID';

export interface IxpConfig {
  EnableReportInbox?: boolean;
}

/**
 * Fetches IXP data for the current user from the Safety Dashboard IXP layer.
 */
const useSafetyDashboardIxp = (): UseQueryResult<IxpConfig> => {
  return useQuery<IxpConfig>({
    queryKey: [`ixp/${IXP_LAYER_NAME}`],
    queryFn: async (): Promise<IxpConfig> => {
      try {
        return await ExperimentationService.getAllValuesForLayer(IXP_LAYER_NAME);
      } catch {
        return {};
      }
    },
    // IXP data shouldn't change frequently so we can cache it indefinitely
    staleTime: Infinity
  });
};

export default useSafetyDashboardIxp;
