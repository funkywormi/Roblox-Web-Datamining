import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { UrlConfig } from "@rbx/core-scripts/http";

export async function setGameFavoriteStatus(
  universeId: number,
  isFavorited: boolean,
): Promise<void> {
  const urlConfig: UrlConfig = {
    url: `${environmentUrls.gamesApi}/v1/games/${universeId}/favorites`,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  await http.post(urlConfig, { isFavorited });
}

export class GameFavoriteStatusMutationError extends Error {
  public readonly confirmedIsFavorited: boolean;
  public readonly hasNewerPendingAction: boolean;

  public constructor(
    error: unknown,
    confirmedIsFavorited: boolean,
    hasNewerPendingAction: boolean,
  ) {
    super(error instanceof Error ? error.message : String(error));
    this.name = "GameFavoriteStatusMutationError";
    this.confirmedIsFavorited = confirmedIsFavorited;
    this.hasNewerPendingAction = hasNewerPendingAction;
  }
}
