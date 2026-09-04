import React, { useMemo } from "react";
import {
  FeedbackBanner,
  ProgressCircle,
  type TFeedbackBannerProps,
  type TProgressCircleProps,
} from "@rbx/foundation-ui";

import type { SduiServices } from "../../services/SduiServices";
import type { AnalyticsFieldMap } from "../../types";
import { DEFAULT_SDUI_ENTRY_POINT_MESSAGES } from "../const/clientConstants";
import { SduiProvider } from "../context/SduiProvider";
import { SduiQueryClientProvider } from "../context/SduiQueryClientProvider";
import { useSduiCacheEntry } from "../hooks/useSduiCacheEntry";
import type { SduiEntryPointMessages } from "../types/SduiEntryPointMessages";
import { SduiClientRenderer } from "./SduiClientRenderer";
import {
  createSduiRenderErrorHandler,
  SduiErrorBoundary,
  type SduiErrorBoundaryFallbackProps,
} from "./SduiErrorBoundary";

// Foundation exports components as `ForwardRefExoticComponent`; narrow to
// `ComponentType` so consumers of these aliases don't need to thread `ref`.
const FoundationProgressCircle = ProgressCircle as React.ComponentType<TProgressCircleProps>;
const FoundationFeedbackBanner = FeedbackBanner as React.ComponentType<TFeedbackBannerProps>;

interface SduiFeatureEntryPointContentProps {
  configKey: string;
  appPage: string;
  identifier?: string;
  additionalAnalyticsData?: AnalyticsFieldMap;
  className?: string;
  style?: React.CSSProperties;
  loadingSlot?: React.ReactNode;
  errorSlot?: React.ReactNode;
  messages?: SduiEntryPointMessages;
  shouldDisplayLoading?: boolean;
  shouldDisplayError?: boolean;
  onRetry?: () => void;
}

function SduiFeatureEntryPointContent({
  configKey,
  appPage,
  identifier,
  additionalAnalyticsData,
  className,
  style,
  loadingSlot,
  errorSlot,
  messages,
  shouldDisplayLoading = true,
  shouldDisplayError = true,
  onRetry,
}: SduiFeatureEntryPointContentProps) {
  const { rootConfig, hasErrored } = useSduiCacheEntry(configKey, identifier);

  const resolvedMessages = useMemo(
    () => ({ ...DEFAULT_SDUI_ENTRY_POINT_MESSAGES, ...messages }),
    [messages],
  );

  // Overlay caller-supplied fields plus `configKey` / `appPage` onto the root
  // analytics context so every descendant inherits them via `ancestorAnalyticsData`.

  rootConfig?.analyticsContext?.setLocalAnalyticsData?.({
    configKey,
    appPage,
    ...additionalAnalyticsData,
  });

  // Render precedence: Error > Resolved > Loading.
  if (hasErrored) {
    if (!shouldDisplayError) return null;
    return (
      <div className={className} style={style}>
        {errorSlot ?? (
          <FoundationFeedbackBanner
            severity="Error"
            title={resolvedMessages.errorTitle}
            description={resolvedMessages.errorDescription}
            {...(onRetry
              ? {
                  primaryActionLabel: resolvedMessages.retryLabel,
                  onPrimaryAction: onRetry,
                }
              : {})}
          />
        )}
      </div>
    );
  }

  if (rootConfig) {
    return (
      <div className={className} style={style}>
        <SduiClientRenderer config={rootConfig} />
      </div>
    );
  }

  if (!shouldDisplayLoading) return null;
  return (
    <div className={className} style={style}>
      {loadingSlot ?? (
        <div className="flex items-center justify-center p-large" role="status" aria-busy="true">
          <FoundationProgressCircle
            ariaLabel={resolvedMessages.loadingAriaLabel}
            size="Medium"
            variant="Indeterminate"
          />
        </div>
      )}
    </div>
  );
}

export interface SduiFeatureEntryPointProps {
  /** Cache key for the SDUI response in `SduiApiStore`. */
  configKey: string;
  /** Selects a specific root config when the response holds more than one. Defaults to the first. */
  identifier?: string;
  /**
   * Per-feature analytics overlay merged onto the root component's analytics
   * context, so impressions/clicks on every descendant include these fields.
   */
  additionalAnalyticsData?: AnalyticsFieldMap;
  className?: string;
  style?: React.CSSProperties;
  loadingSlot?: React.ReactNode;
  errorSlot?: React.ReactNode;
  messages?: SduiEntryPointMessages;
  shouldDisplayLoading?: boolean;
  shouldDisplayError?: boolean;
  onRetry?: () => void;
  errorBoundaryFallback?: React.ComponentType<SduiErrorBoundaryFallbackProps>;
  services: SduiServices;
}

export function SduiFeatureEntryPoint({
  services,
  errorBoundaryFallback,
  configKey,
  identifier,
  ...contentProps
}: SduiFeatureEntryPointProps) {
  const { pageContext } = services;
  const { appPage } = pageContext;

  const handleError = createSduiRenderErrorHandler({
    errorReporter: services.errorReporter,
    pageContext,
    errorDimensions: {
      name: configKey,
      componentType: appPage,
      rootIdentifier: identifier,
    },
  });

  return (
    <SduiQueryClientProvider>
      <SduiProvider services={services} configKey={configKey}>
        <SduiErrorBoundary fallback={errorBoundaryFallback} onError={handleError}>
          <SduiFeatureEntryPointContent
            configKey={configKey}
            appPage={appPage}
            identifier={identifier}
            {...contentProps}
          />
        </SduiErrorBoundary>
      </SduiProvider>
    </SduiQueryClientProvider>
  );
}
