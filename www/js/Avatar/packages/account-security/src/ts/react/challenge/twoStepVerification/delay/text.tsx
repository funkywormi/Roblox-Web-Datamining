// A tiny package standardizing text handlers for delayed actions.
import React from "react";
import * as Either from "fp-ts/Either";
import { sessionManagementLinkWithRedirect } from "../../../../common/urls";
import { TwoStepVerificationResources } from "../constants/resources";
import { useActiveMediaType } from "../hooks/useActiveMediaType";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { DelayMetadata, DelayParameters } from "./types";

export type GetDelayTextProps = {
  delayParameters?: DelayParameters;
  dayTranslation: (numberOfDays: number) => string;
  hourTranslation: (numberOfHours: number) => string;
  minuteTranslation: (numberOfMinutes: number) => string;

  frictionType: string;

  erroneousDelayTranslation: string;
  noWaitTranslation: string;
};

export const calculateDelayByTranslations = ({
  timestamp,
  dayTranslation,
  hourTranslation,
  minuteTranslation,
}: Pick<GetDelayTextProps, "dayTranslation" | "hourTranslation" | "minuteTranslation"> & {
  timestamp: string;
}): string | undefined => {
  const nowUnixMillis = Date.now();
  // There is a conversion step between GCS and upwards that serializes longs as strings. Probably
  // out of fear of Javascript number representations reaching upper bounds.
  const delayUntilMillis = parseInt(timestamp, 10);
  const differenceMillis = delayUntilMillis - nowUnixMillis;
  const totalDiffMinutes = differenceMillis / 1000 / 60; // 60 seconds in a minute, 1000 milliseconds in a second.

  const dayDiff = Math.ceil(totalDiffMinutes / 1440); // 1440 minutes in a day.
  const hourDiff = Math.ceil(totalDiffMinutes / 60); // 60 minutes in an hour.
  const minuteDiff = Math.ceil(totalDiffMinutes); // Just minutes.

  if (totalDiffMinutes > 1440) {
    return dayTranslation(dayDiff);
  } else if (totalDiffMinutes > 60) {
    return hourTranslation(hourDiff);
  } else if (totalDiffMinutes > 0) {
    return minuteTranslation(minuteDiff);
  } else {
    return undefined;
  }
};

export type DelayOffset = {
  numberOfUnits: string;
  unitOfTime: string;
};

export type calculateDelayOffsetProps = {
  timestamp: string;
  dayTranslation: () => string;
  hourTranslation: () => string;
  minuteTranslation: () => string;
};

export const calculateDelayOffset = ({
  timestamp,
  dayTranslation,
  hourTranslation,
  minuteTranslation,
}: calculateDelayOffsetProps): DelayOffset | undefined => {
  const differenceMillis = parseInt(timestamp, 10) - Date.now();
  const totalDiffMinutes = differenceMillis / 1000 / 60;

  if (totalDiffMinutes > 1440) {
    const days = Math.ceil(totalDiffMinutes / 1440);
    return { numberOfUnits: String(days), unitOfTime: dayTranslation() };
  }
  if (totalDiffMinutes > 60) {
    const hours = Math.ceil(totalDiffMinutes / 60);
    return { numberOfUnits: String(hours), unitOfTime: hourTranslation() };
  }
  if (totalDiffMinutes > 0) {
    const minutes = Math.ceil(totalDiffMinutes);
    return { numberOfUnits: String(minutes), unitOfTime: minuteTranslation() };
  }
  return undefined;
};

export const isBypassedByTrustedSession = (delayParameters: DelayParameters): boolean => {
  const maybeGoodParse = Either.tryCatch(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      JSON.parse(delayParameters.metadata) as DelayMetadata,
    () => new Error("Failed to parse metadata"),
  );
  if (Either.isLeft(maybeGoodParse)) {
    return false;
  }

  const { currentSessionTrusted } = maybeGoodParse.right;
  return currentSessionTrusted;
};

export const shouldTrustOtherSessions = (delayParameters: DelayParameters): boolean => {
  const maybeGoodParse = Either.tryCatch(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      JSON.parse(delayParameters.metadata) as DelayMetadata,
    () => new Error("Failed to parse metadata"),
  );
  if (Either.isLeft(maybeGoodParse)) {
    return false;
  }

  const { shouldTrustOtherSessions } = maybeGoodParse.right;
  return shouldTrustOtherSessions;
};

export const getDelayTextFromDates = ({
  delayParameters,
  dayTranslation,
  hourTranslation,
  minuteTranslation,
  erroneousDelayTranslation,
  frictionType,
  noWaitTranslation,
}: GetDelayTextProps): string | undefined => {
  // If there's no timestamp the action isn't delayed, no subtext necessary. This is the original
  // challenge case.
  if (!delayParameters?.delayUntil || isBypassedByTrustedSession(delayParameters)) {
    return undefined;
  }

  const { eligibleMethods } = delayParameters;
  const hardCodedFrictionTypesFallback = eligibleMethods ?? [
    { method: "Passkey", bypassable: true },
    { method: "SecurityKey", bypassable: true },
    { method: "CrossDevice", bypassable: true },
  ];

  if (
    hardCodedFrictionTypesFallback.some(
      eligibleMethod => eligibleMethod.method === frictionType && eligibleMethod.bypassable,
    )
  ) {
    return noWaitTranslation;
  }

  // Things that serialize to NaN.
  if (Number.isNaN(Number(delayParameters.delayUntil))) {
    return erroneousDelayTranslation;
  }

  const maybeDelayText = calculateDelayByTranslations({
    timestamp: delayParameters.delayUntil,
    dayTranslation,
    hourTranslation,
    minuteTranslation,
  });

  if (maybeDelayText === undefined) {
    return noWaitTranslation;
  }

  return maybeDelayText;
};

// getDelayBodyTextFromDates is a convenience wrapper that returns the translated string by delay time
// if delay parameters are present. If the string would have been "No wait", it returns undefined
// instead to avoid being passed onto components that conditionally render the text based on its presence.
export const getDelayBodyTextFromDates = (
  props: GetDelayTextProps &
    // TODO: delete this flag.
    { isDelayedUiEnabled: boolean },
): string | undefined => {
  const delayText = getDelayTextFromDates(props);
  if (!props.isDelayedUiEnabled || delayText === props.noWaitTranslation) {
    return undefined;
  }
  return delayText;
};

// A hook to consolidate some of the text.
export const useDelayedVerificationBodyText = (flag: boolean): string | undefined => {
  const {
    state: { resources, delayParameters },
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();

  return getDelayBodyTextFromDates({
    delayParameters,
    dayTranslation: resources.Label.DelayedVerification.WaitDays,
    hourTranslation: resources.Label.DelayedVerification.WaitHours,
    minuteTranslation: resources.Label.DelayedVerification.WaitMinutes,
    erroneousDelayTranslation: resources.Label.UnableToCalculateDelay,
    frictionType: activeMediaType ?? "",
    noWaitTranslation: resources.Label.NoWait,
    // This can technically be fetched from the hook but doing so makes unit testing much harder,
    // as reducers to set the metadata are internal to the context provider.
    isDelayedUiEnabled: flag,
  });
};

export const getAlternateMethodDelayTextOrDefault = (
  resources: TwoStepVerificationResources,
  defaultText: string,
  delayParameters: DelayParameters | undefined,
  trustedSessionCount: number,
): React.ReactNode => {
  if (!delayParameters || isBypassedByTrustedSession(delayParameters)) {
    return defaultText;
  }

  // 1. Definitely required, we need to get the body text for 2SV. Because if this method is invoked,
  //    we know that there is at least one bypassable method that the user can use.
  const delaySimpleText = calculateDelayByTranslations({
    timestamp: delayParameters.delayUntil,
    dayTranslation: resources.Label.SimpleDay,
    hourTranslation: resources.Label.SimpleHour,
    minuteTranslation: resources.Label.SimpleMinute,
  });

  if (delaySimpleText === undefined) {
    return resources.Label.TryAgainNow;
  }

  const completeDelayTextByMethod = resources.Label.AlternateDelayedMethod(delaySimpleText);
  if (trustedSessionCount > 0 && completeDelayTextByMethod) {
    return (
      <React.Fragment>
        {completeDelayTextByMethod}
        {"\n"}
        {resources.Label.DelayedVerification.TryAgainOnTrustedDeviceSuffix(
          sessionManagementLinkWithRedirect,
        )}
      </React.Fragment>
    );
  }

  if (trustedSessionCount > 0) {
    return (
      <React.Fragment>
        {resources.Label.DelayedVerification.TryAgainOnTrustedDevicePrefix(
          sessionManagementLinkWithRedirect,
        )}
        {"\n"}
        {completeDelayTextByMethod}
      </React.Fragment>
    );
  }

  return completeDelayTextByMethod;
};
