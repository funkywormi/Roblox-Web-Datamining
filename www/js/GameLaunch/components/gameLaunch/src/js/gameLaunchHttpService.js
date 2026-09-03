import { uuidService, httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

function preemptiveStartTeamCreate(placeId) {
  const urlConfig = {
    url: `${EnvironmentUrls.gameJoinApi}/v1/team-create-preemptive`,
    withCredentials: true,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const body = {
    gameJoinAttemptId: uuidService.generateRandomUuid(),
    placeId,
  };
  httpService.post(urlConfig, body);
}

export { preemptiveStartTeamCreate };
