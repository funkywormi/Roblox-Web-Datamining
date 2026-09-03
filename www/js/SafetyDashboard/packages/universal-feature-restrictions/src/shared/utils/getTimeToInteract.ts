import { MILLISECONDS_PER_SECOND, monotonicNowMs } from "./time";

/**
 * Returns the elapsed time in seconds between the dialog's mount time (taken when the content
 * first loads successfully) and the moment of interaction.
 */
export function getTimeToInteract(mountTimeMs: number): number {
  const elapsedMs = Math.max(monotonicNowMs() - mountTimeMs, 0);
  return Math.round(elapsedMs) / MILLISECONDS_PER_SECOND;
}
