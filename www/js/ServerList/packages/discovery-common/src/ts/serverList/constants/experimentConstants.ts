// IXP layer that gates the "Create a player hosted event" entry point on the
// server list. Defaults to disabled until the layer is configured in IXP, so the
// row stays hidden even for universes whose hosting policy is enabled.
export const playerHostedEventsExperimentLayer = "Discovery.EDP.PlayerHostedEvents";

// Parameter (within the layer above) that enables the player-hosted-events entry point.
export const isPlayerHostedEventsEnabledParam = "IsPlayerHostedEventsEnabled";
