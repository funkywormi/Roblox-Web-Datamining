import Presence from "@rbx/presence";

export const IN_GAME_PRESENCE_TYPE = Presence.PresenceType.Game;
export const ONLINE_PRESENCE_TYPES = new Set([
  Presence.PresenceType.Online,
  Presence.PresenceType.Game,
  Presence.PresenceType.Studio,
]);
