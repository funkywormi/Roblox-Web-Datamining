import { Url } from "@rbx/core-lib/url";
import { stripLocalePrefix } from "@rbx/www-common/locale";

export type TGameShareLink = {
  linkId: string;
  version: 1 | 2;
  linkType?: string;
};

const GAME_SHARE_LINK_TYPES = new Set([
  "ExperienceDetails",
  "ExperienceAffiliate",
  "ExperienceInvite",
  "NotificationExperienceInvite",
  "ScreenshotInvite",
  "Server",
  "ExperienceEvent",
]);

/** Only Roblox website URLs can become cards; lookalike domains stay as text. */
const parseRobloxUrl = (url: string): Url | undefined => {
  try {
    return Url.parseWithOptions(url, {
      domainAllowlist: ["roblox.com", ".roblox.com", "robloxlabs.com", ".robloxlabs.com"],
    }).getOrThrow();
  } catch {
    return undefined;
  }
};

export const parseGameShareLink = (url: string): TGameShareLink | undefined => {
  const parsed = parseRobloxUrl(url);
  if (!parsed || !/^\/(share|share-links)\/?$/.test(stripLocalePrefix(parsed.path))) {
    return undefined;
  }
  const linkId = parsed.searchParams.get("code");
  if (!linkId) {
    return undefined;
  }
  const version = parsed.searchParams.get("v");
  if (version === "v2") {
    return { linkId, version: 2 };
  }
  const linkType = parsed.searchParams.get("type");
  if ((version == null || version === "v1") && linkType && GAME_SHARE_LINK_TYPES.has(linkType)) {
    return { linkId, version: 1, linkType };
  }
  return undefined;
};

/** Captures the place id from a `/games/{placeId}` URL. */
const GAME_LINK_PLACE_ID_REGEX = /^\/games\/(\d+)(?:\/|$)/;
/** Splits message text into URL vs non-URL fragments. */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
/** Sentence punctuation typed right after a URL is not part of it. */
const TRAILING_PUNCTUATION_REGEX = /[.,!?;:]+$/;

export type TGameLinkSegment =
  | { type: "text"; content: string }
  | { type: "shareLink"; url: string; shareLink: TGameShareLink }
  | {
      type: "gameCard";
      placeId: string;
      url: string;
      privateServerLinkCode?: string;
    };

/**
 * Split message text into ordered segments: plain text and Roblox game-card links. A URL that
 * matches `/games/{placeId}` becomes a `gameCard` segment (with any privateServerLinkCode).
 * Share links are resolved asynchronously; other fragments are preserved as `text`.
 */
export const parseGameLinkSegments = (content: string): TGameLinkSegment[] => {
  const segments: TGameLinkSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(URL_REGEX)) {
    const url = match[0].replace(TRAILING_PUNCTUATION_REGEX, "");
    const offset = match.index;

    if (offset > lastIndex) {
      segments.push({ type: "text", content: content.slice(lastIndex, offset) });
    }

    const parsed = parseRobloxUrl(url);
    const placeMatch = parsed && GAME_LINK_PLACE_ID_REGEX.exec(stripLocalePrefix(parsed.path));
    if (parsed && placeMatch?.[1]) {
      segments.push({
        type: "gameCard",
        placeId: placeMatch[1],
        url,
        privateServerLinkCode: parsed.searchParams.get("privateServerLinkCode") ?? undefined,
      });
    } else {
      const shareLink = parseGameShareLink(url);
      segments.push(
        shareLink ? { type: "shareLink", url, shareLink } : { type: "text", content: url },
      );
    }

    lastIndex = offset + url.length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", content: content.slice(lastIndex) });
  }

  return segments;
};

/** True when the text contains a direct game link or a share link requiring resolution. */
export const hasGameLink = (content: string): boolean =>
  parseGameLinkSegments(content).some(segment => segment.type !== "text");
