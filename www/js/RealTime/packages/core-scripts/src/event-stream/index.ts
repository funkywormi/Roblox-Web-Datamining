// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- .d.ts reference, not a runtime import, so the Next bundler doesn't try to resolve it as a module
/// <reference path="./eventStream.d.ts" />
import { arrayIncludes } from "@rbx/core-types";
import "../global";

export const eventTypes = {
  formInteraction: "formInteraction",
  modalAction: "modalAction",
  pageLoad: "pageLoad",
  buttonClick: "buttonClick",
};

// TODO: these functions should all be async / awaitable. E.g., when clicking on <a>,
// we want to wait for the metrics to be sent before navigating to the other page.

export const targetTypes = {
  DEFAULT: 0,
  WWW: 1,
  STUDIO: 2,
  DIAGNOSTIC: 3,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- window is typed as always defined but is undefined during Next SSR at module load
  ...(typeof window === "undefined" ? {} : window.Roblox?.EventStream?.TargetTypes),
} as const;

export const sendEventWithTarget = (
  eventName: string,
  context: string,
  additionalProperties: Record<string, string | number | boolean | null | undefined>,
  targetType?: number,
): void => {
  const { EventStream } = window.Roblox;
  if (EventStream?.SendEventWithTarget != null) {
    const validatedTargetType =
      targetType != null && arrayIncludes(Object.values(targetTypes), targetType)
        ? targetType
        : targetTypes.WWW;

    EventStream.SendEventWithTarget(eventName, context, additionalProperties, validatedTargetType);
  }
};

export type Event = {
  name: string;
  type: string;
  context: string;
  requiredParams?: string[];
};

export const sendEvent = (
  event: Event,
  additionalParams: Record<string, string | number | boolean | null | undefined>,
): void => {
  const { name, type, context, requiredParams } = event;
  const eventParams = {
    btn: name,
    ...additionalParams,
  };

  if (Array.isArray(requiredParams)) {
    requiredParams.forEach(requiredParam => {
      if (!Object.hasOwn(eventParams, requiredParam)) {
        console.error(`A required event parameter '${requiredParam}' is not provided`);
      }
    });
  }

  sendEventWithTarget(type, context, eventParams);
};

export const sendGamePlayEvent = (
  context: string,
  placeId: string,
  referrerId: string,
  joinAttemptId: string,
  actionType?: string,
): void => {
  // @ts-expect-error TODO: add types or dummy import
  const { GamePlayEvents } = window.Roblox;
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (GamePlayEvents?.SendGamePlayIntent) {
    // TODO
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    GamePlayEvents.SendGamePlayIntent(context, placeId, referrerId, joinAttemptId, actionType);
  }
};
