/**
 * Configuration settings for Persona Liveness Check
 */

// Matches Lua defaults, but we should probably evaluate what good numbers are.
export const EMBEDDED_FLOW_POLLING_INTERVAL = 2000; // 2 seconds
export const EMBEDDED_FLOW_POLLING_MAX_TIMES = 15; // 30 seconds
export const POLLING_INTERVAL = 6000; // 6 seconds
export const POLLING_MAX_TIMES = 50; // 5 minutes
export const QR_POLLING_INTERVAL = 6000; // 6 seconds
// 10 minutes, can be long lived because the QR does not redeem.
export const QR_POLLING_MAX_TIMES = 100;
