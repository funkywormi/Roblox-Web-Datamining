/**
 * @fileoverview ErrorBoundary.tsx
 * This higher order component is used to catch errors that occur in the children components and report them to AX.
 * The error message is converted to lowercase and spaces are replaced with underscores.
 * The component name is extracted from the component stack and the error message is appended to it.
 * The error is then reported to reportAXError.
 * The data is sent to counters + superset, under table webfrontend_userjourney_actions
 */
import React, { ReactNode } from "react";
import { reportAXError } from "../utils/axAnalyticsService";

interface ErrorBoundaryProps {
  children: ReactNode;
  containerName: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  static isBrowserExtensionError(error: Error, errorInfo: React.ErrorInfo): boolean {
    const stack = error.stack || "";
    const componentStack = errorInfo.componentStack || "";
    return (
      stack.includes("chrome-extension://") ||
      stack.includes("moz-extension://") ||
      stack.includes("safari-extension://") ||
      componentStack.includes("chrome-extension://") ||
      componentStack.includes("moz-extension://") ||
      componentStack.includes("safari-extension://")
    );
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { containerName } = this.props;
    const isExtensionError = ErrorBoundary.isBrowserExtensionError(error, errorInfo);

    // Extract the component name from the component stack
    const componentStack = errorInfo.componentStack?.split("\n")[1]?.trim() || "Unknown Component";
    const componentNameMatch = /at (\w+)/.exec(componentStack);
    const componentName = componentNameMatch ? componentNameMatch[1] : "UnknownComponent";

    // Convert the error message to lowercase and replace spaces with underscores
    const errorMessage = error.message.toLowerCase().replace(/\s+/g, "_").slice(0, 30);

    // Prefix with Extension_ so extension-caused errors are distinguishable in dashboards
    const prefix = isExtensionError ? "Extension_" : "";
    const itemName = `${prefix}${componentName}_${errorMessage}`;

    // Create the log
    const log = JSON.stringify({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report the error
    // We need to specify container name as counters name so we can build the graphs on grafana
    reportAXError({ itemName, counterName: containerName, log });
  }

  render(): React.ReactNode {
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;
