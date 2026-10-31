import environmentUrls from "@rbx/environment-urls";
import type {
  ResolveShareLinksResponse,
  ResolveShareLinksV2Response,
} from "@rbx/www-common/deep-link";
import type { TGameShareLink } from "../utils/gameLinkCard";
import chatHttpTransport from "./chatHttpTransport";

export type TGameShareLinkResult =
  | { type: "invalid" }
  | { type: "unsupported" }
  | {
      type: "game";
      placeId: string;
      privateServerLinkCode?: string;
      gameInstanceId?: string;
      launchData?: string;
    };

const isValidId = (id: string | number | undefined): boolean =>
  id != null && /^\d+$/.test(String(id)) && Number(id) > 0 && Number.isSafeInteger(Number(id));

// v1 uses separate status enums per link type, all with the same successful wire value.
const isValidStatus = (status: string): boolean => status === "Valid";

const resolveUniverse = async (universeId: number | undefined): Promise<TGameShareLinkResult> => {
  if (!isValidId(universeId)) {
    return { type: "invalid" };
  }
  const games = await chatHttpTransport.get<{ data: { id: number; rootPlaceId: number }[] }>(
    { url: `${environmentUrls.gamesApi}/v1/games`, withCredentials: true },
    { universeIds: universeId },
  );
  const game = games.data.find(item => item.id === universeId);
  return isValidId(game?.rootPlaceId)
    ? { type: "game", placeId: String(game?.rootPlaceId) }
    : { type: "invalid" };
};

/** Resolve without navigating or launching. Network failures are handled separately from invalid links. */
export const resolveGameShareLink = async (link: TGameShareLink): Promise<TGameShareLinkResult> => {
  if (link.version === 2) {
    const response = await chatHttpTransport.post<ResolveShareLinksV2Response>(
      { url: `${environmentUrls.shareLinksApiV2}/v2/resolve`, withCredentials: true },
      { linkId: link.linkId },
    );
    if (response.linkType && response.linkType !== "Experience") {
      return { type: "unsupported" };
    }
    if (response.status !== "Valid" || !isValidId(response.targetId)) {
      return { type: "invalid" };
    }
    return {
      type: "game",
      placeId: response.targetId,
      launchData: response.customData ?? undefined,
    };
  }

  if (!link.linkType) {
    return { type: "unsupported" };
  }
  const response = await chatHttpTransport.post<ResolveShareLinksResponse>(
    { url: `${environmentUrls.shareLinksApi}/v1/resolve-link`, withCredentials: true },
    { linkId: link.linkId, linkType: link.linkType },
  );
  switch (link.linkType) {
    case "ExperienceDetails": {
      const data = response.experienceDetailsInviteData;
      return data && isValidStatus(data.status)
        ? resolveUniverse(data.universeId)
        : { type: "invalid" };
    }
    case "ExperienceAffiliate": {
      const data = response.experienceAffiliateData;
      if (!data || !isValidStatus(data.status)) {
        return { type: "invalid" };
      }
      const result = await resolveUniverse(data.universeId);
      return result.type === "game" ? { ...result, launchData: data.joinData?.launchData } : result;
    }
    case "Server": {
      const data = response.privateServerInviteData;
      if (!data || !isValidStatus(data.status)) {
        return { type: "invalid" };
      }
      const result = await resolveUniverse(data.universeId);
      return result.type === "game" ? { ...result, privateServerLinkCode: data.linkCode } : result;
    }
    default: {
      const data =
        link.linkType === "ExperienceInvite"
          ? response.experienceInviteData
          : link.linkType === "NotificationExperienceInvite"
            ? response.notificationExperienceInviteData
            : link.linkType === "ScreenshotInvite"
              ? response.screenshotInviteData
              : link.linkType === "ExperienceEvent"
                ? response.experienceEventData
                : undefined;
      if (!data || !isValidStatus(data.status) || !isValidId(data.placeId)) {
        return { type: "invalid" };
      }
      return {
        type: "game",
        placeId: String(data.placeId),
        gameInstanceId: "instanceId" in data ? data.instanceId : undefined,
        launchData:
          "launchData" in data
            ? data.launchData
            : "joinData" in data
              ? data.joinData.launchData
              : undefined,
      };
    }
  }
};
