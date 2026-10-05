import React from "react";

export interface LoadingProps {
  ariaLabel?: string;
}

/**
 * Loading primitive matching the existing three-dot web loader.
 * It is not registry-backed because there is no corresponding SDUI schema.
 */
export function Loading({ ariaLabel = "Loading" }: LoadingProps): React.JSX.Element {
  return (
    <div
      data-testid="loading"
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
      className="flex items-center justify-center padding-medium"
    >
      <span data-testid="loading-indicator" className="spinner spinner-default" />
    </div>
  );
}
