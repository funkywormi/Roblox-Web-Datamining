// Roblox game-link detection for chat "game cards" (UBIQUITY-3132): a message URL matching
// `/games/{placeId}` becomes a game card; other text/URLs render as plain text. Detection is
// client-side — the server does not flag link cards.

/** Captures the place id from a `/games/{placeId}` URL. */
const GAME_LINK_PLACE_ID_REGEX = /\/games\/(\d+)/;
/** Optional private-server join code carried on the link. */
const PRIVATE_SERVER_LINK_CODE_REGEX = /privateServerLinkCode=(\S+)/;
/** Splits message text into URL vs non-URL fragments. */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export type TGameLinkSegment =
  | { type: "text"; content: string }
  | {
      type: "gameCard";
      placeId: string;
      url: string;
      privateServerLinkCode?: string;
    };

/** True when the text contains at least one Roblox `/games/{id}` link. */
export const hasGameLink = (content: string): boolean => GAME_LINK_PLACE_ID_REGEX.test(content);

/**
 * Split message text into ordered segments: plain text and Roblox game-card links. A URL that
 * matches `/games/{placeId}` becomes a `gameCard` segment (with any privateServerLinkCode);
 * every other fragment — including non-game URLs — is preserved as `text`.
 */
export const parseGameLinkSegments = (content: string): TGameLinkSegment[] => {
  const segments: TGameLinkSegment[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(URL_REGEX)) {
    const url = match[0];
    const offset = match.index;

    if (offset > lastIndex) {
      segments.push({ type: "text", content: content.slice(lastIndex, offset) });
    }

    const placeMatch = GAME_LINK_PLACE_ID_REGEX.exec(url);
    if (placeMatch?.[1]) {
      const privateServerMatch = PRIVATE_SERVER_LINK_CODE_REGEX.exec(url);
      segments.push({
        type: "gameCard",
        placeId: placeMatch[1],
        url,
        privateServerLinkCode: privateServerMatch?.[1],
      });
    } else {
      segments.push({ type: "text", content: url });
    }

    lastIndex = offset + url.length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: "text", content: content.slice(lastIndex) });
  }

  return segments;
};
