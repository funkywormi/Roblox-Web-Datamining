// PingSignalLevel is a latency bucket: "Low" = best signal, so it maps to the
// strongest wifi icon. Each level has its own tooltip key; all fall back to
// "Connection (Ping) Strength" until the per-level strings are registered.

import type { ComponentProps } from "react";
import type { Badge } from "@rbx/foundation-ui";
import serverListConstants from "../constants/serverListConstants";
import type { PingSignalLevel } from "../services/serverListService";

const { resources } = serverListConstants;

export type { PingSignalLevel };

type BadgeIcon = NonNullable<ComponentProps<typeof Badge>["icon"]>;

export type BadgeConfig = {
  icon: BadgeIcon;
  tooltipResource: string;
  defaultTooltip: string;
};

export const PING_SIGNAL_BADGES: Record<PingSignalLevel, BadgeConfig> = {
  Low: {
    icon: "icon-filled-wifi-signal-good",
    tooltipResource: resources.pingSignalLowTooltip,
    defaultTooltip: "Connection (Ping) Strength",
  },
  Medium: {
    icon: "icon-filled-wifi-signal-fair",
    tooltipResource: resources.pingSignalMediumTooltip,
    defaultTooltip: "Connection (Ping) Strength",
  },
  High: {
    icon: "icon-filled-wifi-signal-poor",
    tooltipResource: resources.pingSignalHighTooltip,
    defaultTooltip: "Connection (Ping) Strength",
  },
};

export const LANGUAGE_MATCH_BADGE: BadgeConfig = {
  icon: "icon-filled-language-characters",
  tooltipResource: resources.languageMatchTooltip,
  defaultTooltip: "Players with Language Match",
};

export const FRIEND_COUNT_BADGE: BadgeConfig = {
  icon: "icon-filled-two-people",
  tooltipResource: resources.friendsInServerTooltip,
  defaultTooltip: "Friends in Game",
};

export function isPingSignalLevel(value: unknown): value is PingSignalLevel {
  return value === "Low" || value === "Medium" || value === "High";
}
