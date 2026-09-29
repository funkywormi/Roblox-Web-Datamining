// IXP layer that gates the "Create a player hosted event" entry point on the
// server list. Defaults to disabled until the layer is configured in IXP, so the
// row stays hidden even for universes whose hosting policy is enabled.
export const playerHostedEventsExperimentLayer = "Discovery.EDP.PlayerHostedEvents";

// Parameter (within the layer above) that enables the player-hosted-events entry point.
export const isPlayerHostedEventsEnabledParam = "IsPlayerHostedEventsEnabled";

// IXP layer gating the server-card ping/language/friends badges. Each badge
// has its own parameter below so any subset can be enabled independently.
export const serverCardMetaExperimentLayer = "Discovery.EDP.ServerCardMeta";

export const isServerCardPingIconEnabledParam = "IsServerCardPingIconEnabled";

export const isServerCardLanguageIconEnabledParam = "IsServerCardLanguageIconEnabled";

export const isServerCardFriendsIconEnabledParam = "IsServerCardFriendsIconEnabled";

// Selects the V2 friends server-list URL; independent of the icon badges.
export const isFriendsServerListV2EnabledParam = "IsFriendsServerListV2Enabled";
