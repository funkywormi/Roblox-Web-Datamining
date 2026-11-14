import { GameLauncher } from "@rbx/core-scripts/legacy/Roblox";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { getGameLauncher } from "@rbx/www-common/game-launch";

export type FollowFriendIntoGameOptions = {
  friendUserId: number | string;
  joinAttemptId: string;
};

export async function followFriendIntoGame({
  friendUserId,
  joinAttemptId,
}: FollowFriendIntoGameOptions): Promise<void> {
  const deviceMeta = getDeviceMeta();

  if (deviceMeta?.isInApp) {
    if (deviceMeta.isDesktop) {
      GameLauncher?.followPlayerIntoGame(friendUserId, joinAttemptId, "JoinUser");
    } else {
      window.location.href = `/games/start?userID=${friendUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    }
  } else if (deviceMeta?.isAndroidDevice || deviceMeta?.isChromeOs) {
    window.location.href = `intent://userId=${friendUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser#Intent;scheme=robloxmobile;package=com.roblox.client;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.roblox.client;end`;
  } else if (deviceMeta?.isIosDevice) {
    window.location.href = `robloxmobile://userId=${friendUserId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
  } else {
    const params = { userId: friendUserId, joinAttemptId, joinAttemptOrigin: "JoinUser" };
    // The Next.js host registers the shared launcher; .NET pages keep their protocol handler.
    const launcher = getGameLauncher();
    if (launcher != null) {
      await launcher.followPlayerIntoGame(params);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-deprecated -- .NET fallback, getGameLauncher() is null there
      await window.Roblox.ProtocolHandlerClientInterface?.followPlayerIntoGame(params);
    }
  }
}
