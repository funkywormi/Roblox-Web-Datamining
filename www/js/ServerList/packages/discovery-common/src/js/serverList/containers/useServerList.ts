import { useState, useCallback, useEffect, useRef } from "react";

import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import serverListService from "../services/serverListService";
import type {
  GameInstanceQueryParams,
  GameServerListResponse,
  GameServerPlayerResponse,
  GameServerResponse,
  VipServerSubscriptionResponse,
} from "../services/serverListService";
import trackerClient, {
  PrivateServerEventContext,
  PrivateServerEventType,
} from "../analytics/privateServerLogging";

function deepCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

type GameServerPlayer = {
  [K in Exclude<keyof GameServerPlayerResponse, "playerToken">]: GameServerPlayerResponse[K] | null;
} & Pick<GameServerPlayerResponse, "playerToken">;

export type GameServer = Omit<GameServerResponse, "id" | "players" | "playerTokens"> & {
  id?: string | null;
  players: GameServerPlayer[];
  playerTokens: string[];
  vipServerSubscription?: VipServerSubscriptionResponse;
};

type UseServerListReturn = {
  servers: GameServer[];
  loadMoreServers: (params?: GameInstanceQueryParams, clearServersList?: boolean) => Promise<void>;
  removeServerAtIndex: (index: number) => void;
  clearServerAtIndex: (index: number) => void;
  refreshServers: (params?: GameInstanceQueryParams) => void;
  hasNext: boolean;
  isBusy: boolean;
  setIsBusy: (busy: boolean) => void;
  hasError: boolean;
  isReady: boolean;
  joinRestricted: boolean | null;
};

/**
 * Hook for managing a paginated server list. Each consumer provides its own
 * `getGameServers` fetch function, so instances are isolated — there is no
 * shared cache or risk of duplicate fetching across different server sections.
 *
 * When `initialParams` is provided, automatically fetches on mount.
 */
// eslint-disable-next-line default-param-last
function useServerList(
  getGameServers: (
    placeId: number,
    cursor: string,
    params: GameInstanceQueryParams,
  ) => Promise<{
    data: GameServerListResponse;
  }>,
  fetchPrivateServerDetails = false,
  placeId?: number,
  initialParams?: GameInstanceQueryParams,
): UseServerListReturn {
  const [isBusy, setIsBusy] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [servers, setServers] = useState<GameServer[]>([]);
  const [joinRestricted, setJoinRestricted] = useState<boolean | null>(null);
  const [nextPageCursor, setNextPageCursor] = useState("");
  // becomes true when a list fetch has completed successfully least once
  const [isReady, setIsReady] = useState(false);
  const combinedServers = (
    currentServers: GameServer[],
    newServers: GameServer[],
  ): GameServer[] => {
    // Servers change sizes over time. We might have an instance already even though
    // its in a new response. This isn't like other paged endpoints.
    // ... but we can ensure the list is always de-duplicated!
    const currentServersCopy = deepCopy(currentServers);
    const currentServersGuids: Record<string, GameServer> = {};
    currentServersCopy.forEach(server => {
      if (server.id) {
        currentServersGuids[server.id] = server;
      }
    });

    newServers.forEach(server => {
      if (server.id) {
        const currentServer = currentServersGuids[server.id];
        if (currentServer) {
          Object.assign(currentServer, server);
        } else {
          currentServersCopy.push(server);
        }
      } else {
        // Servers without an id (e.g. shutdown instances) are always appended
        currentServersCopy.push(server);
      }
    });

    // Don't sort this by player count - it feels better as a user to let existng order persist
    return currentServersCopy;
  };

  const loadMoreServers = useCallback(
    async (params: GameInstanceQueryParams = {}, clearServersList = false) => {
      if (isBusy) {
        throw Error("Cannot load more servers while a request is in flight");
      }
      if (placeId == null) {
        throw Error("Cannot load servers without a placeId");
      }

      setIsBusy(true);
      setHasError(false);
      try {
        const {
          data: { data: rawInstances, nextPageCursor: nextPageCursorData, gameJoinRestricted },
        } = await getGameServers(placeId, clearServersList ? "" : nextPageCursor, params);
        setJoinRestricted(gameJoinRestricted ?? null);

        const instances: GameServer[] = rawInstances.map(raw => ({
          ...raw,
          players: raw.players ?? [],
          playerTokens: raw.playerTokens ?? [],
        }));

        await Promise.all(
          instances.map(async instance => {
            // Combine players and playerTokens into a single list
            const { players, playerTokens } = instance;
            const playerTokensToPlayer: Record<string, GameServerPlayer> = {};
            players.forEach(player => {
              playerTokensToPlayer[player.playerToken] = player;
            });

            playerTokens.forEach(playerToken => {
              if (playerTokensToPlayer[playerToken] == null) {
                players.push({
                  id: null,
                  name: null,
                  playerToken,
                  displayName: null,
                });
              }
            });

            if (
              fetchPrivateServerDetails &&
              instance.vipServerId &&
              instance.owner?.id === authenticatedUser.id
            ) {
              const { vipServerId } = instance;
              try {
                const { data } = await serverListService.getVipServer(vipServerId);
                instance.vipServerSubscription = data.subscription;
              } catch {
                // Swallow error, we can show an error loading subscription status
                // in the future if we choose.
              }
            }
          }),
        );

        setServers(clearServersList ? instances : combinedServers(servers, instances));
        setNextPageCursor(nextPageCursorData);
        setIsReady(true);
      } catch {
        setServers([]);
        setNextPageCursor("");
        setHasError(true);
      } finally {
        if (params.startTime !== undefined) {
          const timeDifference = performance.now() - Number(params.startTime);
          window.EventTracker?.endSuccess(PrivateServerEventType.PRIVATE_SERVER_LOAD);
          trackerClient.sendEvent(
            PrivateServerEventType.PRIVATE_SERVER_LOAD,
            PrivateServerEventContext.GAME_TAB,
            String(timeDifference),
          );
        }
        setIsBusy(false);
      }
    },
    [isBusy, placeId, nextPageCursor, servers, getGameServers, fetchPrivateServerDetails],
  );

  // The following two methods exist such that we can avoid full page reloads
  // on server shutdown. They are quick operations and do not require setting the isBusy flag
  const removeServerAtIndex = useCallback(
    (index: number) => {
      if (isBusy) {
        throw Error("Cannot remove server from list while a request is in flight");
      }

      const serversCopy = deepCopy(servers);
      serversCopy.splice(index, 1);
      setServers(serversCopy);
    },
    [isBusy, servers],
  );

  // Clears player list and guid (i.e. private server shutdown)
  const clearServerAtIndex = useCallback(
    (index: number) => {
      if (isBusy) {
        throw Error("Cannot clear server while a request is in flight");
      }

      const serversCopy = deepCopy(servers);
      const server = serversCopy[index];
      if (!server) {
        return;
      }
      server.playerTokens = [];
      server.players = [];
      server.playing = 0;
      server.id = null;
      setServers(serversCopy);
    },
    [isBusy, servers],
  );

  const refreshServers = useCallback(
    (params: GameInstanceQueryParams = {}) => {
      if (isBusy) {
        throw Error("Cannot refresh server list while a request is in flight");
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      loadMoreServers(params, true);
    },
    [isBusy, loadMoreServers],
  );

  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current && initialParams != null) {
      didMount.current = true;
      refreshServers(initialParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    servers,
    loadMoreServers,
    removeServerAtIndex,
    clearServerAtIndex,
    refreshServers,
    hasNext: !!nextPageCursor,
    isBusy,
    setIsBusy,
    hasError,
    isReady,
    joinRestricted,
  };
}

export default useServerList;
