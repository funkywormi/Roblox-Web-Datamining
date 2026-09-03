export const activeEvents = [
  "click",
  "dblclick",
  "focus",
  "hover",
  "keypress",
  "mousedown",
  "mouseenter",
  "mouseover",
  "scroll",
  "touchmove",
  "touchstart",
];
export const defaultRolloutPermille = 1000;
export const defaultActivityTimeoutMs = 600000;
export const defaultHeartbeatPulseIntervalMs = 20000;
export const defaultWorkerVersion = 1;

export type HeartbeatStartEvent = number;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type HeartbeatEvent = {};
