import { ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render, Container } from "react-dom";
import { ErrorBoundary } from "@sentry/react";
import { reportError } from "../../sentry";

const renderWithErrorBoundary = (
  element: ReactNode,
  container: Container | null,
  callback?: () => void,
  fallback?: ErrorBoundary["props"]["fallback"],
  onError?: (error: unknown, componentStack: string, eventId: string) => void,
): void => {
  if (!container) {
    reportError(new Error("renderWithErrorBoundary was given no container."));
  }

  render(
    <ErrorBoundary fallback={fallback} onError={onError}>
      {element}
    </ErrorBoundary>,
    container,
    callback,
  );
};

export default renderWithErrorBoundary;
