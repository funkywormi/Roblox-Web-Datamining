import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";
import { GroupsForUserResponse } from "../types/apiResponseTypes";

export type Group = {
  id: number;
  name: string;
  description: string;
  hasVerifiedBadge: boolean;
  owner: {
    type?: string;
    hasVerifiedBadge?: boolean;
    userId?: number;
    username?: string;
    displayName?: string;
  } | null;
  role?: {
    id: number;
    name: string;
    rank: number;
  };
  isOwner?: boolean;
  isPrimaryGroup?: boolean;
  created?: string;
  hasSocialModules?: boolean;
  isBuildersClubOnly?: boolean;
  memberCount?: number;
  publicEntryAllowed?: boolean;
  shout?: string | null;
};

export async function fetchGroupsForUserAsync(id: string): Promise<GroupsForUserResponse[]> {
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.groupsApi}/v1/users/${id}/groups/roles?includeLocked=true`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await http.get<{ data: GroupsForUserResponse[] }>(urlConfig);
  return response.data.data;
}
