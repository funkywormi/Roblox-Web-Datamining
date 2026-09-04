import { httpService, urlService } from "@rbx/core-scripts/legacy/core-utilities";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import type { PrimaryGroup } from "../types/primaryGroup";

type GetPrimaryGroupResponse = {
  group?: {
    id: number;
    name: string;
  };
};

export type MultiGetPrimaryGroupItem = {
  userId: number;
  primaryGroup?: PrimaryGroup;
};

const getUserPrimaryGroup = async (userId: number): Promise<PrimaryGroup | undefined> => {
  const response = await httpService.get<GetPrimaryGroupResponse>({
    retryable: true,
    withCredentials: true,
    url: `${playerSearchConstants.urls.primaryGroupUrl}/${userId}/groups/primary/role`,
  });

  if (!response.data.group) {
    return undefined;
  }

  return {
    id: response.data.group.id,
    name: response.data.group.name,
    url: urlService.getAbsoluteUrl(`/groups/${response.data.group.id}`),
  };
};

export const multiGetUserPrimaryGroups = async (
  userIds: number[],
): Promise<MultiGetPrimaryGroupItem[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const groups: MultiGetPrimaryGroupItem[] = [];

  await Promise.all(
    userIds.map(async (userId, index) => {
      try {
        groups[index] = {
          userId,
          primaryGroup: await getUserPrimaryGroup(userId),
        };
      } catch (error) {
        console.error("playerSearch: primary group lookup failed, dropping the group line", {
          userId,
          error,
        });

        groups[index] = {
          userId,
          primaryGroup: undefined,
        };
      }
    }),
  );

  return groups;
};
