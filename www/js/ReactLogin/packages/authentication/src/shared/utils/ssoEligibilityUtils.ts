type StudioEmbeddedWindow = Window & {
  rbx?: {
    postMessage?: unknown;
  };
};

export type SsoEligibility = {
  isStudioEmbeddedWebView: boolean;
};

export const isStudioEmbeddedWebView = (): boolean =>
  typeof (window as StudioEmbeddedWindow).rbx?.postMessage === "function";

export const isSsoEligible = ({ isStudioEmbeddedWebView: isStudio }: SsoEligibility): boolean =>
  // Google blocks OAuth in embedded web views, so Studio's embedded sign-in never offers SSO.
  !isStudio;
