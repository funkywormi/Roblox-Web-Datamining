import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getSessions } from "../../../common/request/apis/sessionManagement";
import {
  GetSessionsReturnType,
  SessionManagementError,
  TokenMetadataItem,
} from "../../../common/request/types/sessionManagement";
import { DEFAULT_DESIRED_LIMIT } from "../../sessionManagement/app.config";

const SESSIONS_QUERY_KEY = ["sessions"] as const;
const MAX_RETRIES = 5;

async function getFullPageOfSessions(): Promise<GetSessionsReturnType> {
  let sessions: TokenMetadataItem[] = [];
  let hasMore = true;
  let nextCursor = "";
  let numTries = 0;

  while (sessions.length < DEFAULT_DESIRED_LIMIT && numTries < MAX_RETRIES && hasMore) {
    const limit = (DEFAULT_DESIRED_LIMIT - sessions.length).toString();
    // eslint-disable-next-line no-await-in-loop
    const result = await getSessions(nextCursor || undefined, limit);

    if (result.isError) {
      throw new Error(String(result.error ?? "Unknown session fetch error"));
    }

    sessions = sessions.concat(result.value.sessions);
    hasMore = result.value.hasMore;
    nextCursor = result.value.nextCursor;
    numTries += 1;
  }

  return { sessions, hasMore, nextCursor };
}

export const useSessionsQuery = (): UseQueryResult<
  GetSessionsReturnType,
  SessionManagementError | null
> =>
  useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: getFullPageOfSessions,
  });

export const useTrustedSessionCount = (): number | undefined => {
  const { data } = useSessionsQuery();
  return data?.sessions.filter(s => s.isTrustedSession).length;
};
