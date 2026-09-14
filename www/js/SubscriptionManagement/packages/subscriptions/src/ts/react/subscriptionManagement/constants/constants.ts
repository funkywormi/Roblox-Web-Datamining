export const RESULTS_PER_PAGE = 10;

export const SUBSCRIPTIONS_HELP_LINK = "https://help.roblox.com/hc/sections/20316062241172";

export const ROBLOX_ANNUAL_PREMIUM = "Roblox Annual Premium";

// Days before renewal that we start showing the low-balance banner for credit-funded subs.
// Mirrors the backend `LowBalanceWarningInDays` in subscriptions-api Settings (currently 7).
// Kept in sync manually since ListSubscriptions does not expose the window to the client.
export const LOW_BALANCE_WARNING_DAYS = 7;
