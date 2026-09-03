import { Component, type ErrorInfo, type ReactNode } from "react";

type GiftRobuxErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type GiftRobuxErrorBoundaryState = {
  hasError: boolean;
};

/**
 * Gift-flow-scoped boundary. Captures to Sentry when the browser SDK is present
 * without adding a direct package dependency.
 */
class GiftRobuxErrorBoundary extends Component<
  GiftRobuxErrorBoundaryProps,
  GiftRobuxErrorBoundaryState
> {
  constructor(props: GiftRobuxErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): GiftRobuxErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    try {
      window.Sentry?.captureException?.(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    } catch {
      // Reporting must never break recovery UI.
    }

    const { onError } = this.props;
    onError?.(error, errorInfo);
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback;
    }

    return children;
  }
}

export default GiftRobuxErrorBoundary;
