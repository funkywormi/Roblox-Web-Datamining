import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { sendEvent as sendEventStreamEvent } from "@rbx/core-scripts/event-stream";
import { TEvent, EventStreamMetadata } from "../constants/eventStreamConstants";
import sessionStorageUtils from "../utils/sessionStorageUtils";
import parsingUtils from "../utils/parsingUtils";
import { TAppsFlyerRefParams, getAppsFlyerReferralParams } from "../utils/appsFlyerReferralUtils";

type TReactRouterDOMHistory = ReturnType<typeof useHistory>;
type TReactRouterDOMLocation = ReturnType<typeof useLocation>;
type TEventMetadataOverrideKeys =
  | EventStreamMetadata.UniverseId
  | EventStreamMetadata.PlaceId
  | EventStreamMetadata.ShareLinkId
  | EventStreamMetadata.ShareLinkType;
type TEventMetadataOverrides = Record<TEventMetadataOverrideKeys, string | number | boolean>;
export type PartialEventMetadataOverrides = Partial<TEventMetadataOverrides>;
// Only evaluated once at mount time. Values are read from the initial URL and
// are not reactive to subsequent changes.
type TMountOptions = {
  // Suffix used to identify query params whose keys are server-provided (e.g.
  // from analyticsData). The suffix will be stripped before sending the event.
  queryParamSuffixForServerProvidedKeys?: string;
};
type TServerProvidedQueryParams = Record<string, string | string[]>;
const { parseQueryString, composeQueryString } = parsingUtils;

export const usePageReferralTracker = <T extends Record<string, unknown>>(
  eventParamsGenerator: (params?: T) => TEvent,
  eventParams: Array<keyof T>,
  queryParams: string[],
  eventMetadataOverrides: PartialEventMetadataOverrides = {},
  location: Location | TReactRouterDOMLocation = window.location,
  history: History | TReactRouterDOMHistory = window.history,
  mountOptions: TMountOptions = {},
): {
  referralParams: T;
  appsFlyerReferralParams: Partial<TAppsFlyerRefParams>;
  serverProvidedQueryParams: TServerProvidedQueryParams;
} => {
  const { queryParamSuffixForServerProvidedKeys } = mountOptions;
  const [referralParams, setReferralParams] = useState<T>(
    parseQueryString(location.search) as unknown as T,
  );
  const appsFlyerReferralParams = useMemo<Partial<TAppsFlyerRefParams>>(
    () => getAppsFlyerReferralParams(location),
    [location],
  );

  const serverProvidedQueryParams = useMemo(() => {
    if (queryParamSuffixForServerProvidedKeys === undefined) {
      return {};
    }

    const params = parseQueryString(location.search);
    const parsedServerProvidedQueryParams: Record<string, string | string[]> = {};
    // Check the query string for params that were added dynamically and add
    // them to the parsedServerProvidedQueryParams object after removing the suffix from the key
    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        return;
      }

      if (key.endsWith(queryParamSuffixForServerProvidedKeys)) {
        const newKey = key.slice(0, key.length - queryParamSuffixForServerProvidedKeys.length);
        parsedServerProvidedQueryParams[newKey] = value;
      }
    });

    return parsedServerProvidedQueryParams;
    // We only want to run this once on mount because the params are removed
    // from the URL once the event is sent and we don't want this to become an
    // empty object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTReactRouterDOMHistory = (
    historyObject: TReactRouterDOMHistory | History,
  ): historyObject is TReactRouterDOMHistory => {
    return (historyObject as TReactRouterDOMHistory).replace !== undefined;
  };

  const isHistory = (historyObject: TReactRouterDOMHistory | History): historyObject is History => {
    return (historyObject as History).replaceState !== undefined;
  };

  const sendEvent = () => {
    // Building Event / Query object
    const params = parseQueryString(location.search);
    const parsedEventParams = eventParams.reduce(
      (acc, curr) => {
        if (params[curr as string] !== undefined && params[curr as string] !== null) {
          acc[curr] = params[curr as string];
        }
        return acc;
      },
      // serverProvidedQueryParams is set as the base object so that the statically
      // defined event params override them if there are any overlapping keys.
      // note that we do a shallow copy here so that the original object is not mutated
      { ...serverProvidedQueryParams } as Record<keyof T, unknown>,
    ) as T;

    const parsedQueryParams = queryParams.reduce<Record<string, unknown>>((acc, curr) => {
      if (params[curr] !== undefined && params[curr] !== null) {
        acc[curr] = params[curr];
      }
      return acc;
    }, {});
    // Do not want to expose placeId other than the case with launchData
    if (!parsedQueryParams.launchData && parsedQueryParams.placeId) {
      delete parsedQueryParams.placeId;
    }
    setReferralParams(parsedEventParams);
    sessionStorageUtils.setPerTabEventProperties(parsedEventParams);
    // Handling both react router and regular route pages
    if (isTReactRouterDOMHistory(history)) {
      history.replace(`${location.pathname}${composeQueryString(parsedQueryParams)}`);
    }
    if (isHistory(history)) {
      history.replaceState(
        undefined,
        "",
        `${location.pathname}${location.hash}${composeQueryString(parsedQueryParams)}`,
      );
    }

    // Trigger Event
    sendEventStreamEvent(
      ...eventParamsGenerator({ ...parsedEventParams, ...eventMetadataOverrides }),
    );
  };

  useEffect(() => {
    sendEvent();
    // We only want to send the referral event once on mount. The URL params are
    // consumed and removed from the URL after the event is sent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { referralParams, appsFlyerReferralParams, serverProvidedQueryParams };
};

export default usePageReferralTracker;
