import type { AxiosResponse } from "@rbx/core-scripts/http";
import { httpService } from "core-utilities";
import gameBadgesConstants from "../constants/gameBadgesConstants";
import { TBadge, TGetGameBadgesResponse } from "../types/gameBadgesTypes";

const { urls } = gameBadgesConstants;
export const getGameBadges = async (
  universeId: string,
  cursor?: string,
  limit?: number,
): Promise<TGetGameBadgesResponse> => {
  const {
    data: { data, nextPageCursor, previousPageCursor },
  }: AxiosResponse<TGetGameBadgesResponse> = await httpService.get(
    urls.getGameBadges(universeId, cursor, limit),
  );
  return {
    data: data.filter((badge: TBadge) => badge.enabled),
    nextPageCursor,
    previousPageCursor,
  };
};

export default {
  getGameBadges,
};
