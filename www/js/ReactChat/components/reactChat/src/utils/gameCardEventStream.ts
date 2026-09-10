import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

// Game-card eventstream telemetry. Do NOT rename these strings — they are the analytics contract
// (they must match the event names/params the eventstream backend already indexes), not display
// text.
const EVENT_ACTIONS = {
  render: "render",
  click: "click",
} as const;

const EVENT_NAMES = {
  loadGameLinkCardInChat: "loadGameLinkCardInChat",
  gameImpressions: "gameImpressions",
  clickLinkCardInChat: "clickLinkCardInChat",
  clickPlayFromLinkCardInChat: "clickBtnFromLinkCardInChat",
} as const;

/** pageContext value sent with link-card eventstream events. */
const PAGE_LINK_CARD_IN_CHAT = "linkCardInChat";

/** Fired once when a game card renders. */
export function sendLoadGameLinkCardEvent(placeId: string, conversationId: string): void {
  sendEventWithTarget(EVENT_NAMES.loadGameLinkCardInChat, EVENT_ACTIONS.render, {
    placeId,
    conversationId,
  });
}

/**
 * Fired once when a game card becomes visible. Shape matches the games-list impression event:
 * id/position arrays are single-element since a card is one game.
 */
export function sendGameLinkCardImpressionEvent(rootPlaceId: number, universeId: number): void {
  sendEventWithTarget(EVENT_NAMES.gameImpressions, EVENT_ACTIONS.render, {
    page: PAGE_LINK_CARD_IN_CHAT,
    rootPlaceIds: JSON.stringify([rootPlaceId]),
    universeIds: JSON.stringify([universeId]),
    absPositions: JSON.stringify([0]),
    sortPos: 0,
  });
}

/** Fired when the card title/body is clicked to open the game details. */
export function sendClickGameLinkCardEvent(placeId: string, conversationId: string): void {
  sendEventWithTarget(EVENT_NAMES.clickLinkCardInChat, EVENT_ACTIONS.click, {
    placeId,
    conversationId,
  });
}

/** Fired when the card's play button is clicked. */
export function sendClickPlayFromGameLinkCardEvent(placeId: string, conversationId: string): void {
  sendEventWithTarget(EVENT_NAMES.clickPlayFromLinkCardInChat, EVENT_ACTIONS.click, {
    placeId,
    conversationId,
  });
}
