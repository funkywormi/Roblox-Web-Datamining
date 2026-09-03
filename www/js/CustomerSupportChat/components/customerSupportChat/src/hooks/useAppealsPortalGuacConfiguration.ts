import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { callBehaviour } from "@rbx/core-scripts/guac";

interface GuacConfig {
  EnableOptOutCommunication: boolean;
}

const GUAC_NAMESPACE = "appeals-portal";

/**
 * We use GUAC (Great Universal App Configurator) to query if the user is from the UK.
 * For UK OSA compliance, we need to allow UK users the ability to opt-out of communication
 * from Roblox in regards to appeals.
 */
const useAppealsPortalGuacConfiguration = (): UseQueryResult<GuacConfig> =>
  useQuery({
    queryKey: [`guac/${GUAC_NAMESPACE}`],
    queryFn: async (): Promise<GuacConfig> => {
      try {
        const guacConfig = await callBehaviour<GuacConfig>(GUAC_NAMESPACE);
        return guacConfig;
      } catch (e) {
        // On any error, just return "false" for enabling the opt-out checkbox
        return {
          EnableOptOutCommunication: false,
        };
      }
    },
    // GUAC data shouldn't change frequently so we can cache it indefinitely
    staleTime: Infinity,
  });

export default useAppealsPortalGuacConfiguration;
