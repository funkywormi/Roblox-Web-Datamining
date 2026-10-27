import * as json from "@rbx/core-lib/json";
import { parseInt } from "@rbx/core-lib/number";
import { stringToBase64Url } from "@rbx/core-lib/string";
import { AnyUrl } from "@rbx/core-lib/url/any";

// Builds the base64url-encoded LaunchContext blob (deferred game-join intent) from the live
// PlaceLauncher URL, so the desktop client can rebuild the join after install. This is the inverse
// of the engine decode (game-engine Client/RobloxMac AppStartupHelper::tryDecodeLaunchContext):
// url-safe alphabet, no padding, UTF-8 JSON. Returns null when there is no placeId to join
// (e.g. follow-user), in which case a plain LinkId deep link is used instead.
// requestType/conversationId (play-together) are carried ahead of engine-side decode support.

const launchContextVersion = 1;

const optionalStringParams = [
  "joinAttemptOrigin",
  "accessCode",
  "linkCode",
  "gameId",
  "launchData",
  "eventId",
  "conversationId",
] as const;

function buildLaunchContext(
  placeLauncherUrl: string,
  launchExp?: string,
  referredByPlayerId?: number | string,
): string | null {
  const params = AnyUrl.parse(placeLauncherUrl).getOrNull()?.searchParams;
  if (params == null) {
    return null;
  }

  const placeId = parseInt(params.get("placeId") ?? "");
  if (placeId == null || placeId <= 0) {
    return null;
  }

  const referrerOverride = parseInt(String(referredByPlayerId ?? ""));
  const context: Record<string, string | number | boolean> = {
    v: launchContextVersion,
    joinType: "GameJoin",
    placeId,
    isPlayTogetherGame: params.get("isPlayTogetherGame") === "true",
    referredByPlayerId:
      referrerOverride != null && referrerOverride > 0
        ? referrerOverride
        : (parseInt(params.get("referredByPlayerId") ?? "0") ?? 0),
  };

  const requestType = params.get("request");
  if (requestType) {
    context.requestType = requestType;
  }

  for (const key of optionalStringParams) {
    const value = params.get(key);
    if (value) {
      context[key] = value;
    }
  }

  if (launchExp) {
    context.launchExp = launchExp;
  }

  return stringToBase64Url(json.serialize(context).value);
}

export default buildLaunchContext;
