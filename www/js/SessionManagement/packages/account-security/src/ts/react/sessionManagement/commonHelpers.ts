import { RequestService } from "../../common/request";
import { SessionManagementError } from "../../common/request/types/sessionManagement";
import { DEFAULT_DESIRED_LIMIT } from "./app.config";
import { TokenMetadataItemCollated } from "./constants/types";

// sortSessions sorts sessions by last accessed time. The current session is
// placed at the beginning of the first page regardless of its last accessed time.
export const sortSessions = (
  unsorted: TokenMetadataItemCollated[],
  isFirstPage: boolean,
): TokenMetadataItemCollated[] => {
  let sorted = [...unsorted];
  const listBeginning: TokenMetadataItemCollated[] = [];
  if (isFirstPage) {
    const currentSessionIndex = unsorted.findIndex(element => element.isCurrentSession);
    listBeginning.push(unsorted[currentSessionIndex]!);
    sorted.splice(currentSessionIndex, 1);
  }
  sorted = sorted.sort((a, b) => {
    if (a.lastAccessedTimestampEpochMilliseconds === null) {
      return 1;
    }
    if (b.lastAccessedTimestampEpochMilliseconds === null) {
      return -1;
    }
    return (
      parseInt(b.lastAccessedTimestampEpochMilliseconds, 10) -
      parseInt(a.lastAccessedTimestampEpochMilliseconds, 10)
    );
  });
  return listBeginning.concat(sorted);
};

// collateSessions groups parent and child sessions together if they have the
// same lastAccessedIp, unless both have a null lastAccessedIp.
// We also ignore cases where the parent and child both have defined but
// mismatched User Agent types (e.g. browser vs. Studio).
export const collateSessions = (
  uncollated: TokenMetadataItemCollated[],
): TokenMetadataItemCollated[] => {
  let collated = [...uncollated];
  const uncollatedMap = uncollated.reduce<Map<string, TokenMetadataItemCollated>>((map, item) => {
    map.set(item.token, item);
    return map;
  }, new Map<string, TokenMetadataItemCollated>());
  const toBeDeletedTokens = new Set<string>();

  for (let i = 0; i < uncollated.length; i++) {
    const { parentSessionToken } = uncollated[i]!;
    if (parentSessionToken !== null && uncollated[i]?.parent == null) {
      const parent = uncollatedMap.get(parentSessionToken);
      if (
        parent != null &&
        parent.lastAccessedIp === uncollated[i]?.lastAccessedIp &&
        (parent.lastAccessedIp !== null || uncollated[i]?.lastAccessedIp !== null) &&
        (parent.agent === null ||
          uncollated[i]?.agent === null ||
          parent.agent.type === uncollated[i]?.agent?.type)
      ) {
        collated[i]!.parent = parent;
        toBeDeletedTokens.add(parent.token);
      }
    }
  }
  collated = collated.filter(item => !toBeDeletedTokens.has(item.token));
  return collated;
};

// separateUnknownSessions separates a list of sorted sessions into known and
// unknown sessions. Always call sortSessions on the list before passing it to
// this function, since it relies on last access time to find the list boundary
// between known and unknown sessions.
export const separateUnknownSessions = (
  sorted: TokenMetadataItemCollated[],
): { knownSessions: TokenMetadataItemCollated[]; unknownSessions: TokenMetadataItemCollated[] } => {
  const firstUnknownIndex = sorted.findIndex(
    element => element.lastAccessedTimestampEpochMilliseconds === null && !element.isCurrentSession,
  );
  if (firstUnknownIndex === -1) {
    return { knownSessions: sorted, unknownSessions: [] };
  }
  return {
    knownSessions: sorted.slice(0, firstUnknownIndex),
    unknownSessions: sorted.slice(firstUnknownIndex),
  };
};

// getFullPageOfSessions repeatedly calls the get sessions endpoint to get a
// list of sessions with length DEFAULT_DESIRED_LIMIT.
export const getFullPageOfSessions = async (
  requestService: RequestService,
  startCursor: string,
): Promise<
  | { isError: false; sessions: TokenMetadataItemCollated[]; hasMore: boolean; nextCursor: string }
  | { isError: true; error: SessionManagementError | null }
> => {
  let numTries = 0;
  let sessions: TokenMetadataItemCollated[] = [];
  let hasMore = true;
  let nextCursor = startCursor;
  // Retry request up to 5 times in the case that we get empty/incomplete pages.
  while (sessions.length < DEFAULT_DESIRED_LIMIT && numTries < 5 && hasMore) {
    // eslint-disable-next-line no-await-in-loop
    const getSessionsResult = await requestService.sessionManagement.getSessions(
      nextCursor,
      (DEFAULT_DESIRED_LIMIT - sessions.length).toString(),
    );

    if (getSessionsResult.isError) {
      return { isError: true, error: getSessionsResult.error };
    }

    sessions = sessions.concat(getSessionsResult.value.sessions);
    hasMore = getSessionsResult.value.hasMore;
    nextCursor = getSessionsResult.value.nextCursor;
    numTries += 1;
  }
  return { isError: false, sessions, hasMore, nextCursor };
};
