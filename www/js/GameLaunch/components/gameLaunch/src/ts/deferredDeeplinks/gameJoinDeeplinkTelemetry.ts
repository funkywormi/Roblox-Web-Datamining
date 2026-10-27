import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export type GameJoinDeeplinkOutcome =
  | "noLaunchContext"
  | "ixpOff"
  | "unsupportedPage"
  | "minted"
  | "tokenFailed";

const fireTelemetryCounter = createFireTelemetryCounter("Download");

const fireGameJoinDeeplinkCounter = (outcome: GameJoinDeeplinkOutcome): void => {
  fireTelemetryCounter("GameJoinDeeplinkToken", { outcome });
};

export default fireGameJoinDeeplinkCounter;
