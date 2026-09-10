export const NANOSECONDS_PER_SECOND = 1_000_000_000;
export const MILLISECONDS_PER_SECOND = 1000;

export function monotonicNowMs(): number {
  return performance.now();
}
