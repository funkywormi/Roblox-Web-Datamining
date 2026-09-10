import type { TPresenceType } from "../types/chat";

const presenceLabelKeys: Record<TPresenceType, string> = {
  Online: "Label.Online",
  InGame: "Label.InGame",
  InStudio: "Label.InStudio",
  Offline: "Label.Offline",
};

export const getPresenceLabel = (
  presence: TPresenceType,
  translate: (key: string) => string,
): string => translate(presenceLabelKeys[presence]);
