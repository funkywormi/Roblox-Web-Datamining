import React, { useCallback, useEffect } from "react";
import { FeedbackBanner, type TFeedbackBannerProps } from "@rbx/foundation-ui";

import type { SduiServices } from "../../services/SduiServices";
import { applyRootAnalyticsOverlay } from "../../analytics/applyRootAnalyticsOverlay";
import type { AnalyticsFieldMap, ApiRequestConfig } from "../../types";
import { getConfigKey, pickRootConfig } from "../../utils/apiStoreHelper";
import { DEFAULT_SDUI_ENTRY_POINT_MESSAGES } from "../const/clientConstants";
import { SduiProvider, useSduiServices } from "../context/SduiProvider";
import { SduiQueryClientProvider } from "../context/SduiQueryClientProvider";
import { useSduiCacheSubscription } from "../hooks/useSduiCacheEntry";
import { useSduiPageLoadPaint } from "../hooks/useSduiPageLoadPaint";
import type { SduiEntryPointMessages } from "../types/SduiEntryPointMessages";
import { resolveEntryPointState } from "../utils/resolveEntryPointState";
import { SduiClientRenderer } from "./SduiClientRenderer";
import {
  SduiContentBoundary,
  type SduiEntryPointErrorProps,
  type SduiEntryPointLoadingProps,
} from "./SduiContentBoundary";
import {
  createSduiRenderErrorHandler,
  SduiErrorBoundary,
  type SduiErrorBoundaryFallbackProps,
} from "./SduiErrorBoundary";

const FoundationFeedbackBanner = FeedbackBanner as React.ComponentType<TFeedbackBannerProps>;

function DefaultSduiPageErrorFallback({
  reset,
}: SduiErrorBoundaryFallbackProps): React.JSX.Element {
  return (
    <FoundationFeedbackBanner
      severity="Error"
      title={DEFAULT_SDUI_ENTRY_POINT_MESSAGES.errorTitle}
      description={DEFAULT_SDUI_ENTRY_POINT_MESSAGES.errorDescription}
      primaryActionLabel={DEFAULT_SDUI_ENTRY_POINT_MESSAGES.retryLabel}
      onPrimaryAction={reset}
    />
  );
}

export interface SduiPageEntryIdentifiers {
  rootIdentifier?: string;
  titleIdentifier?: string;
}

export interface SduiPageEntryPointProps {
  requestConfig: ApiRequestConfig;
  services: SduiServices;
  identifiers: SduiPageEntryIdentifiers;
  additionalAnalyticsData?: AnalyticsFieldMap;
  containerClassName?: string;
  LoadingComponent?: React.ComponentType<SduiEntryPointLoadingProps>;
  ErrorComponent?: React.ComponentType<SduiEntryPointErrorProps>;
  statusMessages?: SduiEntryPointMessages;
  errorBoundaryFallback?: React.ComponentType<SduiErrorBoundaryFallbackProps>;
}

interface SduiPageEntryPointInnerProps {
  requestConfig: ApiRequestConfig;
  identifiers: SduiPageEntryIdentifiers;
  additionalAnalyticsData?: AnalyticsFieldMap;
  containerClassName?: string;
  LoadingComponent?: React.ComponentType<SduiEntryPointLoadingProps>;
  ErrorComponent?: React.ComponentType<SduiEntryPointErrorProps>;
  statusMessages?: SduiEntryPointMessages;
}

function SduiPageEntryPointInner({
  requestConfig,
  identifiers,
  additionalAnalyticsData,
  containerClassName,
  LoadingComponent,
  ErrorComponent,
  statusMessages,
}: SduiPageEntryPointInnerProps): React.JSX.Element | null {
  const configKey = getConfigKey(requestConfig);
  const { apiStore, pageContext } = useSduiServices();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void apiStore.fetchIfNeeded(requestConfig);
  }, [apiStore, requestConfig]);

  const refresh = useCallback(() => {
    // eslint-disable-next-line no-void
    void apiStore.refreshFromApi(configKey);
  }, [apiStore, configKey]);

  const entry = useSduiCacheSubscription(apiStore, configKey);
  const { rootConfig, hasContent, hasErrored, isLoading } = resolveEntryPointState(
    entry,
    identifiers.rootIdentifier,
  );
  const titleConfig = identifiers.titleIdentifier
    ? pickRootConfig(entry, identifiers.titleIdentifier)
    : undefined;

  useSduiPageLoadPaint(configKey, hasContent);

  const analyticsOverlay: AnalyticsFieldMap = {
    configKey,
    appPage: pageContext.appPage,
    ...additionalAnalyticsData,
  };
  applyRootAnalyticsOverlay(rootConfig, analyticsOverlay);
  applyRootAnalyticsOverlay(titleConfig, analyticsOverlay);

  return (
    <SduiContentBoundary
      containerClassName={containerClassName}
      statusMessages={statusMessages}
      LoadingComponent={LoadingComponent}
      ErrorComponent={ErrorComponent}
      onRetry={requestConfig.onRetry ?? refresh}
      hasErrored={hasErrored}
      hasContent={hasContent}
      isLoading={isLoading}
    >
      {titleConfig ? <SduiClientRenderer config={titleConfig} /> : null}
      {rootConfig ? <SduiClientRenderer config={rootConfig} /> : null}
    </SduiContentBoundary>
  );
}

/**
 * Full-page SDUI entry point. Fetches `requestConfig`, selects the requested
 * root config, gates loading/error, and renders the SDUI component tree.
 */
export function SduiPageEntryPoint({
  requestConfig,
  services,
  identifiers,
  additionalAnalyticsData,
  containerClassName,
  LoadingComponent,
  ErrorComponent,
  statusMessages,
  errorBoundaryFallback,
}: SduiPageEntryPointProps): React.JSX.Element {
  const { pageContext } = services;

  const resolvedConfigKey = getConfigKey(requestConfig);

  const handleError = createSduiRenderErrorHandler({
    errorReporter: services.errorReporter,
    pageContext,
    errorDimensions: {
      name: resolvedConfigKey,
      componentType: pageContext.appPage,
      rootIdentifier: identifiers.rootIdentifier,
    },
  });

  return (
    <SduiQueryClientProvider>
      <SduiProvider services={services} configKey={resolvedConfigKey}>
        <SduiErrorBoundary
          fallback={errorBoundaryFallback ?? DefaultSduiPageErrorFallback}
          onError={handleError}
        >
          <SduiPageEntryPointInner
            requestConfig={requestConfig}
            identifiers={identifiers}
            additionalAnalyticsData={additionalAnalyticsData}
            containerClassName={containerClassName}
            LoadingComponent={LoadingComponent}
            ErrorComponent={ErrorComponent}
            statusMessages={statusMessages}
          />
        </SduiErrorBoundary>
      </SduiProvider>
    </SduiQueryClientProvider>
  );
}
