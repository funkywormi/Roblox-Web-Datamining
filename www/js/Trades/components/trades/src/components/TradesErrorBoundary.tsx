import React from "react";
import { error as logError } from "../utils/logger";
import { sendAXError } from "../services/tradeEvents";

type TradesErrorBoundaryProps = {
  children: React.ReactNode;
  fallbackMessage: string;
};

type TradesErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

/**
 * Catches render-time errors so a single failure doesn't blank out (and freeze)
 * the whole trades app the way an uncaught error does in React 17. Logs the full
 * error + component stack to the console for debugging.
 */
export class TradesErrorBoundary extends React.Component<
  TradesErrorBoundaryProps,
  TradesErrorBoundaryState
> {
  constructor(props: TradesErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: Error): TradesErrorBoundaryState {
    return { hasError: true, message: err?.message };
  }

  componentDidCatch(err: Error, info: React.ErrorInfo): void {
    logError("render error caught by boundary:", err, info?.componentStack);
    sendAXError("renderErrorBoundary", err, { componentStack: info?.componentStack });
  }

  render(): React.ReactNode {
    const { hasError, message } = this.state;
    const { children, fallbackMessage } = this.props;

    if (hasError) {
      return (
        <div className="section-content-off">
          <p className="no-items text-error">{fallbackMessage}</p>
          {message && <p className="text-footer">{message}</p>}
        </div>
      );
    }

    return children;
  }
}

export default TradesErrorBoundary;
