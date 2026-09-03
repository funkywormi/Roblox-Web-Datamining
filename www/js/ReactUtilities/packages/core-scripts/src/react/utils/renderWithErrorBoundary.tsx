import { ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { render, Container } from "react-dom";
import { ErrorBoundary } from "@sentry/react";

const renderWithErrorBoundary = (
  element: ReactNode,
  container: Container | null,
  callback?: () => void,
  fallback?: ErrorBoundary["props"]["fallback"],
  onError?: (error: unknown, componentStack: string, eventId: string) => void,
): void => {
  render(
    <ErrorBoundary fallback={fallback} onError={onError}>
      {element}
    </ErrorBoundary>,
    container,
    callback,
  );
};

export default renderWithErrorBoundary;
