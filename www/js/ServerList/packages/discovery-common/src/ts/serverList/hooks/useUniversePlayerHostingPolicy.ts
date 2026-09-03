import { useQuery } from "@tanstack/react-query";
import { UniversePlayerHostingStatus } from "@rbx/client-player-hosted-events-api/v1";
import { playerHostedEventsApi } from "../clients/playerHostedEvents";

const UNIVERSE_PLAYER_HOSTING_POLICY_QUERY_KEY = "universePlayerHostingPolicy";

/**
 * Resolves whether players may host events in the given universe. An absent
 * policy is effectively DISABLED per the player-hosted-events contract, as is
 * a policy that is still loading or failed to load.
 */
const useUniversePlayerHostingPolicy = (
  universeId: number | undefined,
): { isHostingEnabled: boolean } => {
  const { data } = useQuery({
    queryKey: [UNIVERSE_PLAYER_HOSTING_POLICY_QUERY_KEY, universeId],
    queryFn: () =>
      playerHostedEventsApi.v1beta1PlayerHostedEventsApiUniversePlayerHostingPolicyUniverseIdGet({
        universeId: universeId ?? 0,
      }),
    enabled: !!universeId,
    staleTime: 3600000,
  });

  return {
    isHostingEnabled: data?.policy?.status === UniversePlayerHostingStatus.Enabled,
  };
};

export default useUniversePlayerHostingPolicy;
