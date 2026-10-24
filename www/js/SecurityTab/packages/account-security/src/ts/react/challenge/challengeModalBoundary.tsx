import React from "react";
import type { ReactNode } from "react";
import { reportError } from "@rbx/core-scripts/sentry";

type Props = {
  onError: () => void;
  children: ReactNode;
};

type State = { hasError: boolean };

class ChallengeModalBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    const { onError } = this.props;
    reportError(error);
    onError();
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children } = this.props;
    return hasError ? null : children;
  }
}

export default ChallengeModalBoundary;
