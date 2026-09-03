import * as EventType from './eventType';

export const EnableTabLoader = () => ({
  type: EventType.SET_TABLOADER,
  data: { isLoading: true }
});

export const DisableTabLoader = () => ({
  type: EventType.SET_TABLOADER,
  data: { isLoading: false }
});
