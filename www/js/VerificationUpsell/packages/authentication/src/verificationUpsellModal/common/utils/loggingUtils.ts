import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";

type EventParams = Record<string, string | number | boolean | null | undefined>;

type VerificationUpsellEvent = {
  type: string;
  context: string;
  params?: EventParams;
};

export const sendVerificationUpsellEvent = (
  event: VerificationUpsellEvent,
  params: { origin?: string; section?: string },
): void => {
  sendEventWithTarget(event.type, event.context, {
    ...event.params,
    origin: params.origin,
    section: params.section,
  });
};

export const getErrorEventWithErrorCodeParam = (
  error: VerificationUpsellEvent,
  code: EventParams[string],
): VerificationUpsellEvent => {
  const err = { ...error };
  err.params = { ...err.params, errorCode: code };
  return err;
};
