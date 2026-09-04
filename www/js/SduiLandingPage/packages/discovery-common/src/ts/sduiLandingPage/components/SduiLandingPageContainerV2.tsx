import "@rbx/core-scripts/http/core-intercept";
import React, { useEffect, useMemo, useState } from "react";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import {
  decodeJsonWithSchema,
  type ApiRequestConfig,
  type CacheStatus,
  type SduiApiResponse,
  type SduiServices,
} from "@rbx/sdui-core";
import { SduiFeatureEntryPoint } from "@rbx/sdui-core/client";
import { FeatureSduiLandingPage } from "../../common/constants/translationConstants";
import { usePageSession } from "../../common/utils/PageSessionContext";
import { getSessionInfoKey, toV1PageContext } from "../../sdui/v2/utils/pageReferralUtils";
import { logSduiError, SduiErrorNames } from "../../sdui/utils/logSduiError";
import type { ISduiLandingPageConfiguration } from "../types/sduiLandingPageTypes";
import { buildSduiLandingPageEntryPointMessages } from "../utils/sduiEntryPointMessages";
import { getSubPageAnalyticsData } from "../utils/sduiLandingPageHelpers";
import { redirectToDataFetchErrorFallback } from "../utils/redirectToDataFetchErrorFallback";
import ErrorPage from "./ErrorPage";

export type SduiLandingPageContainerV2Props = WithTranslationsProps & {
  pageConfig: ISduiLandingPageConfiguration;
  /** Page-scoped service graph for this surface, composed by the caller. */
  services: SduiServices;
};

// Reads the SSR-injected proto-JSON payload (when the backend stamps one
// for this surface) and decodes it through the same converter the network
// path uses.
type DecodeJsonInput = Parameters<typeof decodeJsonWithSchema>[1];

function readSeedFromHtml(
  htmlPayloadId: string | undefined,
  protoSchema: ApiRequestConfig["protoSchema"],
  appPage: ISduiLandingPageConfiguration["appPage"],
): SduiApiResponse | null {
  if (!htmlPayloadId || !protoSchema) return null;
  if (typeof document === "undefined") return null;
  const element = document.getElementById(htmlPayloadId);
  const text = element?.textContent;
  if (!text) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return decodeJsonWithSchema(protoSchema, parsed as DecodeJsonInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logSduiError(
      SduiErrorNames.SduiLandingPageDataParseError,
      `Failed to parse ${appPage} SSR payload: ${message}`,
      toV1PageContext({ pageName: appPage, appPage }),
    );
    return null;
  }
}

export const SduiLandingPageContainerV2 = ({
  pageConfig,
  services,
  translate,
}: SduiLandingPageContainerV2Props): React.JSX.Element => {
  const {
    appPage,
    buildConfigKey,
    buildRequestUrl,
    buildTargetedRefreshUrl,
    protoSchema,
    responseFormat,
    htmlPayloadId,
    entryPoints,
    pageSlug,
    dataFetchErrorFallback,
  } = pageConfig;
  const sessionId = usePageSession();
  const { pageContext } = services;
  const configKey = useMemo(() => buildConfigKey(pageSlug), [buildConfigKey, pageSlug]);

  const entryPointMessages = useMemo(
    () => buildSduiLandingPageEntryPointMessages(translate),
    [translate],
  );

  const additionalAnalyticsData = useMemo(() => {
    const data = { ...getSubPageAnalyticsData(appPage) };
    const sessionInfoKey = getSessionInfoKey(pageContext);
    if (sessionId && sessionInfoKey) {
      data[sessionInfoKey] = sessionId;
    }
    return data;
  }, [appPage, pageContext, sessionId]);

  const [status, setStatus] = useState<CacheStatus>(
    () => services.apiStore.getCacheSignal(configKey).peek()?.status ?? "idle",
  );
  const [cacheError, setCacheError] = useState<Error | undefined>(
    () => services.apiStore.getCacheSignal(configKey).peek()?.error,
  );

  const requestConfig = useMemo<ApiRequestConfig>(() => {
    const requestUrl = buildRequestUrl(pageSlug, sessionId);

    return {
      url: requestUrl,
      surfaceKey: appPage,
      configKey,
      responseFormat,
      protoSchema,
      buildTargetedRefreshUrl: buildTargetedRefreshUrl
        ? targets => buildTargetedRefreshUrl(targets, sessionId)
        : undefined,
    };
  }, [
    appPage,
    buildRequestUrl,
    buildTargetedRefreshUrl,
    configKey,
    pageSlug,
    protoSchema,
    responseFormat,
    sessionId,
  ]);

  useEffect(() => {
    const seed = readSeedFromHtml(htmlPayloadId, protoSchema, appPage);
    if (seed) {
      services.apiStore.seedFromResponse(seed, requestConfig);
      setStatus(services.apiStore.getCacheSignal(configKey).peek()?.status ?? "loaded");
      setCacheError(undefined);
      return;
    }

    const cacheSignal = services.apiStore.getCacheSignal(configKey);
    let previousStatus = cacheSignal.peek()?.status;
    const unsubscribe = cacheSignal.subscribe(entry => {
      const nextStatus = entry?.status ?? "idle";
      if (nextStatus === "error" && previousStatus !== "error") {
        logSduiError(
          SduiErrorNames.SduiLandingPageDataFetchError,
          `Failed to fetch ${appPage} data for slug ${pageSlug}: ${
            entry?.error?.message ?? "unknown error"
          }`,
          toV1PageContext(pageContext),
        );
      }
      setCacheError(entry?.error);
      setStatus(nextStatus);
      previousStatus = nextStatus;
    });

    services.apiStore.fetchIfNeeded(requestConfig);

    return unsubscribe;
  }, [appPage, configKey, htmlPayloadId, pageSlug, protoSchema, requestConfig, services]);

  useEffect(() => {
    if (status !== "error" || dataFetchErrorFallback?.type !== "redirect") {
      return;
    }

    redirectToDataFetchErrorFallback(
      dataFetchErrorFallback.url,
      dataFetchErrorFallback.replaceHistory,
    );
  }, [dataFetchErrorFallback, status]);

  if (status === "error") {
    if (dataFetchErrorFallback?.type === "redirect") {
      return <Loading />;
    }

    if (dataFetchErrorFallback?.type === "customComponent") {
      const CustomErrorComponent = dataFetchErrorFallback.component;

      return (
        <CustomErrorComponent
          translate={translate}
          pageConfig={pageConfig}
          pageContext={pageContext}
          error={cacheError}
        />
      );
    }

    return (
      <ErrorPage
        translate={translate}
        titleKey={FeatureSduiLandingPage.ErrorContentFetchTitle}
        messageKey={FeatureSduiLandingPage.ErrorContentFetchDescription}
      />
    );
  }

  if (status === "idle" || status === "loading") {
    return <Loading />;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        gap: "24px",
      }}
    >
      {entryPoints.map(entryPoint => (
        <SduiFeatureEntryPoint
          key={entryPoint.identifier}
          configKey={configKey}
          identifier={entryPoint.identifier}
          services={services}
          additionalAnalyticsData={additionalAnalyticsData}
          messages={entryPointMessages}
          shouldDisplayLoading={false}
        />
      ))}
    </div>
  );
};

export default SduiLandingPageContainerV2;
