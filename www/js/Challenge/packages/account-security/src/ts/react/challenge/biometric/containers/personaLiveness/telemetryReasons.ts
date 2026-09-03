/**
 * Fixed `reason` strings emitted on biometric event-stream and metrics events
 * across the persona liveness flows. Always pick a value from this map — never
 * pass a dynamic string — so analytics dashboards can rely on a closed set.
 *
 * The first segment encodes the UI variant:
 *   - `persona*`  → V1 embedded Persona webview (line `personaLivenessV1.tsx`)
 *   - `hosted*`   → V1 hosted-modal handoff (`personaLivenessHostedModal.tsx`)
 *   - `QR*`       → V2 QR deeplink handoff (`personaLivenessV2.tsx`)
 */
export const TELEMETRY_REASONS = {
  // `challengeDisplayed`: which UI variant became visible.
  PERSONA_DISPLAYED: "PersonaDisplayed",
  HOSTED_DISPLAYED: "HostedDisplayed",
  QR_DISPLAYED: "QRDisplayed",

  // `challengeInvalidated`: cause of an unrecoverable failure.
  START_LIVENESS_FAILED: "StartLivenessFailed",
  PERSONA_POLLING_TIMEOUT: "PersonaPollingTimeout",
  HOSTED_POLLING_TIMEOUT: "HostedPollingTimeout",
  QR_POLLING_TIMEOUT: "QRPollingTimeout",

  // `challengeAbandoned`: who/what triggered the abandon.
  PERSONA_USER_ABANDON: "PersonaUserAbandon",
  HOSTED_USER_ABANDON: "HostedUserAbandon",
  QR_USER_ABANDON: "QRUserAbandon",

  // `challengeCompleted`: who/what triggered the completion.
  PERSONA_COMPLETED: "PersonaCompleted",
  HOSTED_COMPLETED: "HostedCompleted",
  QR_COMPLETED: "QRCompleted",
} as const;

export type TelemetryReason = (typeof TELEMETRY_REASONS)[keyof typeof TELEMETRY_REASONS];
