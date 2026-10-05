import React, { useMemo } from "react";
import {
  FeedbackBanner,
  ProgressCircle,
  type TFeedbackBannerProps,
  type TProgressCircleProps,
} from "@rbx/foundation-ui";

import { DEFAULT_SDUI_ENTRY_POINT_MESSAGES } from "../const/clientConstants";
import type { SduiEntryPointMessages } from "../types/SduiEntryPointMessages";

const FoundationProgressCircle = ProgressCircle as React.ComponentType<TProgressCircleProps>;
const FoundationFeedbackBanner = FeedbackBanner as React.ComponentType<TFeedbackBannerProps>;

export type ResolvedSduiEntryPointMessages = Required<SduiEntryPointMessages>;

export type SduiEntryPointLoadingProps = {
  statusMessages: ResolvedSduiEntryPointMessages;
};

export type SduiEntryPointErrorProps = {
  statusMessages: ResolvedSduiEntryPointMessages;
  onRetry?: () => void;
};

function DefaultSduiEntryPointLoading({
  statusMessages,
}: SduiEntryPointLoadingProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center padding-large" role="status" aria-busy="true">
      <FoundationProgressCircle
        ariaLabel={statusMessages.loadingAriaLabel}
        size="Medium"
        variant="Indeterminate"
      />
    </div>
  );
}

function DefaultSduiEntryPointError({
  statusMessages,
  onRetry,
}: SduiEntryPointErrorProps): React.JSX.Element {
  return (
    <FoundationFeedbackBanner
      severity="Error"
      title={statusMessages.errorTitle}
      description={statusMessages.errorDescription}
      {...(onRetry
        ? {
            primaryActionLabel: statusMessages.retryLabel,
            onPrimaryAction: onRetry,
          }
        : {})}
    />
  );
}

export interface SduiContentBoundaryProps {
  containerClassName?: string;
  style?: React.CSSProperties;
  statusMessages?: SduiEntryPointMessages;
  LoadingComponent?: React.ComponentType<SduiEntryPointLoadingProps>;
  ErrorComponent?: React.ComponentType<SduiEntryPointErrorProps>;
  onRetry?: () => void;
  shouldDisplayLoading?: boolean;
  shouldDisplayError?: boolean;
  hasErrored: boolean;
  hasContent: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

/**
 * Shared loading / error / content gating for SDUI entry points.
 * Render precedence: Error → Content → Loading → null.
 */
export function SduiContentBoundary({
  containerClassName,
  style,
  statusMessages,
  LoadingComponent = DefaultSduiEntryPointLoading,
  ErrorComponent = DefaultSduiEntryPointError,
  onRetry,
  shouldDisplayLoading = true,
  shouldDisplayError = true,
  hasErrored,
  hasContent,
  isLoading,
  children,
}: SduiContentBoundaryProps): React.JSX.Element | null {
  const resolvedStatusMessages = useMemo(
    () => ({ ...DEFAULT_SDUI_ENTRY_POINT_MESSAGES, ...statusMessages }),
    [statusMessages],
  );

  if (hasErrored) {
    if (!shouldDisplayError) return null;
    return (
      <div className={containerClassName} style={style}>
        <ErrorComponent statusMessages={resolvedStatusMessages} onRetry={onRetry} />
      </div>
    );
  }

  if (hasContent) {
    return (
      <div className={containerClassName} style={style}>
        {children}
      </div>
    );
  }

  if (isLoading) {
    if (!shouldDisplayLoading) return null;
    return (
      <div className={containerClassName} style={style}>
        <LoadingComponent statusMessages={resolvedStatusMessages} />
      </div>
    );
  }

  return null;
}
