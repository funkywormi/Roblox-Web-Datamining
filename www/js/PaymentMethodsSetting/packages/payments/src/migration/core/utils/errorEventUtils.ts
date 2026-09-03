import { fireEvent } from 'roblox-event-tracker';
import type { AxiosError } from 'axios';

export const isAxiosError = (e: unknown): e is AxiosError =>
  !!e && typeof e === 'object' && 'isAxiosError' in (e as Record<string, unknown>);

export function fireApiErrorCounters(feature: string, call: string, error: unknown): void {
  if (isAxiosError(error)) {
    fireEvent(`ERROR_COUNTER_${feature}_${call}_${error.response?.status || 'UnknownAxiosError'}`);
  } else {
    fireEvent(`ERROR_COUNTER_${feature}_${call}_NonAxiosError`);
  }
}
