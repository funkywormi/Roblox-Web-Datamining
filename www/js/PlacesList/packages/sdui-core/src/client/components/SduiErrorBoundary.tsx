import React, { Component } from "react";

import { SduiErrorName } from "../../errors/SduiErrors";
import { reportError } from "../../errors/SduiLogger";
import type { SduiErrorDimensions, SduiErrorReporter, SduiPageContext } from "../../types";
import { useSduiServices } from "../context/SduiProvider";

export interface SduiErrorBoundaryFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  reset: () => void;
}

export type SduiErrorBoundaryErrorHandler = (error: Error, errorInfo: React.ErrorInfo) => void;

export interface SduiErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ComponentType<SduiErrorBoundaryFallbackProps>;
  /**
   * Called once per caught error, from `componentDidCatch`. Receives the raw
   * React arguments so hosts can log whatever their pipeline needs —
   * `error.name` / `error.message` for grouping, `errorInfo.componentStack`
   * for the subtree that threw.
   */
  onError: SduiErrorBoundaryErrorHandler;
}

interface SduiErrorBoundaryState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Catches render-time exceptions from descendants, forwards them to `onError`,
 * and renders either a caller-supplied `fallback` component or `null`.
 *
 * Holds no SDUI dependencies of its own so it can be mounted anywhere in a tree,
 * including outside of `SduiProvider`.
 */
export class SduiErrorBoundary extends Component<SduiErrorBoundaryProps, SduiErrorBoundaryState> {
  state: SduiErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<SduiErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    this.props.onError(error, errorInfo);
  }

  private readonly reset = (): void => {
    this.setState({ error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    const { error, errorInfo } = this.state;
    if (!error) {
      return this.props.children;
    }
    const Fallback = this.props.fallback;
    if (!Fallback) return null;
    // `errorInfo` lands one render after `error` (React calls
    // `getDerivedStateFromError` first, then `componentDidCatch`); fall back
    // to an empty `componentStack` so the fallback always gets a defined shape.
    return (
      <Fallback error={error} errorInfo={errorInfo ?? { componentStack: "" }} reset={this.reset} />
    );
  }
}

export interface CreateSduiRenderErrorHandlerOptions {
  errorReporter: SduiErrorReporter;
  pageContext?: SduiPageContext;
  /**
   * Extra grouping / dedup dimensions. `name` defaults to the JS error class.
   */
  errorDimensions?: SduiErrorDimensions;
}

/**
 * Build the standard SDUI `onError` that reports the caught error as
 * `UncaughtRenderError` through the supplied reporter.
 *
 * Takes its services as arguments rather than reading `SduiProvider`, to stay free of
 * any context requirement.
 */
export function createSduiRenderErrorHandler({
  errorReporter,
  pageContext,
  errorDimensions,
}: CreateSduiRenderErrorHandlerOptions): SduiErrorBoundaryErrorHandler {
  return (error: Error) => {
    reportError(
      SduiErrorName.UncaughtRenderError,
      error.message,
      pageContext,
      // `name` participates in the dedup key, so default it to the JS error
      // class for sensible bucketing while still letting callers override
      // via `errorDimensions`.
      { ...errorDimensions, name: errorDimensions?.name ?? error.name },
      errorReporter,
    );
  };
}

export interface UseSduiRenderErrorHandlerOptions {
  /**
   * Extra grouping / dedup dimensions. `name` defaults to the JS error class.
   */
  errorDimensions?: SduiErrorDimensions;
}

/**
 * Convenience wrapper around `createSduiRenderErrorHandler` for trees inside
 * an `SduiProvider`. Pulls `errorReporter` / `pageContext` from context so
 * callers only need to pass optional dimensions.
 *
 * Prefer `createSduiRenderErrorHandler` when the boundary sits *outside*
 * `SduiProvider` (e.g. entry points) and the caller already holds the services.
 */
export function useSduiRenderErrorHandler(
  options: UseSduiRenderErrorHandlerOptions = {},
): SduiErrorBoundaryErrorHandler {
  const { errorDimensions } = options;

  const { errorReporter, pageContext } = useSduiServices();

  return createSduiRenderErrorHandler({
    errorReporter,
    pageContext,
    errorDimensions,
  });
}
