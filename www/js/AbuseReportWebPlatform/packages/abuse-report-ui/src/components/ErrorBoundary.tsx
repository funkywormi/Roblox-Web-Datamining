import React, { Component } from "react";

interface Props {
  children: React.ReactNode;
  renderError: (error: unknown) => React.ReactNode;
  onError?: (error: unknown, componentStack: string) => void;
}

interface State {
  error?: unknown;
}

/**
 * Basic Error Boundary component.
 * In the future we should consider sentry integration, but that is a bit
 * unclear at the moment since this code will run both in /workspace and /WebApps
 * where the setup is different.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown, info: { componentStack: string }): void {
    this.props.onError?.(error, info.componentStack);
  }

  render(): React.ReactNode {
    const { error } = this.state;
    const { children, renderError } = this.props;
    if (error) {
      return renderError(error);
    }

    return children;
  }
}
