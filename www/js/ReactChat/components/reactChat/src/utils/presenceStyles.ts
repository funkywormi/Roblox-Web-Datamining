import type { TPresenceType } from "../types/chat";

// Presence dot fill per state, matching legacy web chat: online = blue, in-game = green,
// in-studio = orange. Offline shows no dot (like legacy), so it has no entry. These are
// authored classes in main.scss (not foundation `bg-*` utilities), which the utility build
// would only emit if used elsewhere.
export const presenceDotClassByType: Record<Exclude<TPresenceType, "Offline">, string> = {
  Online: "react-chat-presence-online",
  InGame: "react-chat-presence-in-game",
  InStudio: "react-chat-presence-in-studio",
};
