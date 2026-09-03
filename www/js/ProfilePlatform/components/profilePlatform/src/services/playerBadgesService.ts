import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";
import type { PlayerBadgesResponse } from "../types/apiResponseTypes";

export type PlayerBadge = {
  id: number;
  name: string;
  displayName: string;
};

export async function fetchBadgeByIdAsync(badgeId: number): Promise<PlayerBadgesResponse> {
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.badgesApi}/v1/badges/${badgeId}`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };
  const response = await http.get<PlayerBadgesResponse>(urlConfig);
  return response.data;
}
