import type { ReactNode } from "react";
import type { EventTypes, SendAnalyticsEvent } from "../telemetry/analytics";
import type { TPunishment } from "../utils/types";

/**
 * Translates a localization key into a user-facing string using the host's translation
 * provider. Optional `params` are interpolated into the template (e.g. `{count}` or
 * link placeholders). The returned string should already be localized for the current
 * user's locale; the package does not perform any additional locale resolution.
 */
export type TranslateFunction = (key: string, params?: Record<string, string>) => string;

/**
 * HTTP GET client supplied by the host. Must perform an authenticated request
 * against `url` and resolve with the parsed JSON body typed as `T`.
 *
 * Rejection contract: callers in this package treat the rejection as opaque and
 * only use it to branch into an error state (they never read `response.status`,
 * `message`, or any other field). Hosts may therefore reject with any value —
 * an `Error`, an axios-like error object, or anything else — as long as the
 * returned promise rejects on network and non-2xx HTTP failures.
 */
export type HttpGet = <T>(url: string) => Promise<T>;

/**
 * HTTP POST client supplied by the host. Must perform an authenticated request
 * against `url` with an optional JSON `body` and resolve with the parsed JSON
 * response body typed as `T`. Shares the same opaque rejection contract as
 * {@link HttpGet}.
 */
export type HttpPost = <T>(url: string, body?: object) => Promise<T>;

/**
 * Normalized age experience supplied by the host. Hosts should map their own age-tier signal to
 * one of these values and use `default` when the signal is missing or unrecognized.
 */
export enum AgeExperience {
  Default = "default",
  Kids = "kids",
  Select = "select",
}

export interface NotApprovedUIConfig {
  /**
   * Translation lookup function. See {@link TranslateFunction}.
   */
  translate: TranslateFunction;

  /**
   * HTTP GET client supplied by the host. See {@link HttpGet}.
   */
  httpGet: HttpGet;

  /**
   * HTTP POST client supplied by the host. See {@link HttpPost}.
   */
  httpPost: HttpPost;

  /**
   * Base URL (scheme + host, no trailing slash) for the user moderation API,
   * e.g. `https://usermoderation.roblox.com`. Used to fetch the current user's
   * punishment data and to submit reactivation requests.
   */
  userModerationApiUrl: string;

  /**
   * Base URL (scheme + host, no trailing slash) for the Roblox API gateway,
   * e.g. `https://apis.roblox.com`. Used to fetch commutation eligibility and
   * to reactivate accounts via the moderation-appeal-service.
   */
  apiGatewayUrl: string;

  /**
   * Base URL (scheme + host, no trailing slash) for the Roblox website,
   * e.g. `https://www.roblox.com`. Used to build links to the appeals portal
   * and other site pages opened in new tabs.
   */
  websiteUrl: string;

  /**
   * Host-owned logout flow. Called when the user clicks "Log out" in the
   * not-approved header menu. The host performs the network call and navigates
   * the user away. The package wraps this in a useMutation solely to drive
   * `isPending` for the spinner. If the callback rejects, the package catches
   * the error, fires an `EventTypes.Error` analytics event with a
   * context-specific label, and resets the loading state so the user can retry.
   * Hosts do not need to catch or log errors themselves.
   */
  onLogout: () => Promise<void> | void;

  /**
   * Host-owned navigation after a successful account reactivation (both the
   * commutation path and the legacy not-approved/reactivate path). The package
   * owns the endpoint and the 2s cache-purge wait; this callback only decides
   * where the user lands. The return type is intentionally void — hosts that
   * need to do async work before navigation should fire it off (e.g. via
   * `router.push` which itself returns a promise) and let the component
   * unmount naturally, rather than returning a promise to the package.
   */
  onAccountReactivated: () => void;

  /**
   * Forwards an analytics event to the host's event pipeline. See
   * {@link SendAnalyticsEvent}.
   */
  sendAnalyticsEvent: SendAnalyticsEvent;

  /**
   * Identifier for the host platform, included in every analytics event payload
   * as the `platform` property. Each host must supply its own value (e.g.
   * `"WebApp"`, `"CreatorHub"`). There is no default — the package never
   * assumes which host it is running in.
   */
  platform: string;

  /**
   * Age experience for the current host session. Hosts that omit this field retain the standard
   * Not Approved Page treatment.
   */
  ageExperience?: AgeExperience;

  /**
   * Optional IXP (experimentation) integration. When provided, the package
   * fetches a layer of experiment parameters and logs exposure when the user
   * is enrolled in a treatment that affects the not-approved page. Hosts that
   * do not integrate with IXP can omit this field — the package will simply
   * skip experiment-gated UI.
   *
   * - `fetchLayer(layerName)` should resolve with the parameters for the named
   *   layer, or an empty object if the user is not enrolled.
   * - `logExposure(layerName)` should log an exposure event for the named layer
   *   so that the host's experimentation system can attribute downstream metrics.
   *
   * Note: the package invokes these as plain property calls (`ixp.fetchLayer(...)`).
   * If the host backs them with methods on a class instance (e.g. a service
   * singleton), wrap them in arrow functions or `.bind()` the instance so they
   * retain their `this` context — passing the bare method reference detaches
   * `this` and will throw when the method reads instance state.
   */
  ixp?: {
    fetchLayer: (layerName: string) => Promise<Record<string, unknown>>;
    logExposure: (layerName: string) => void;
  };

  /**
   * Invoked when the user clicks the email verification CTA on a chargeback
   * punishment (18+ users). The host should open its email verification flow
   * and resolve once the flow has closed. The package temporarily closes its
   * own dialog while this promise is pending so the verification UI is not
   * obscured.
   */
  onVerifyEmail?: () => Promise<void>;

  /**
   * Invoked when the user clicks the parent verification (VPC) CTA on a
   * chargeback punishment (U18 users). The host should open its parent
   * verification / upsell flow using the provided options and resolve once
   * the flow has closed. The package reopens its own dialog after the
   * promise settles.
   */
  onVerifyParent?: (options: {
    featureName: string;
    namespace?: string;
    ampRecourseData: { punishmentType: string };
    isAsyncCall: boolean;
    usePrologue: boolean;
  }) => Promise<void>;

  /**
   * Optional renderer for the self-service account deactivation UI. When the
   * current user has deactivated their own account (as reported by the
   * punishment API), the package hands off entirely to this renderer instead
   * of showing the normal moderation dialog. If omitted, the package renders
   * the built-in GenericFallbackDialog in that state.
   */
  renderSelfServiceDeactivated?: () => ReactNode;

  /**
   * Optional callback that opts the host into the package's built-in
   * generic fallback dialog. When this callback returns an impression event
   * for the current punishment, the package renders a self-contained dialog
   * with a "Heading.AccountIssue" title, a body that links the user to
   * `websiteUrl`, a "Logout" button (driven by `onLogout`), and a
   * "Go to Roblox" button that opens `websiteUrl` in a new tab.
   *
   * Return an `EventTypes` value to show the dialog (the returned event
   * fires as the impression on mount). Return `false` to fall through to
   * the default moderation dialog.
   *
   * The callback receives the full `TPunishment` so consumers can decide
   * based on any punishment property (verificationCategory, context flags,
   * punishment type, etc.).
   *
   * Priority order, highest to lowest:
   *   1. `renderSelfServiceDeactivated`
   *   2. Built-in GenericFallbackDialog
   *   3. The default moderation dialog
   */
  shouldShowGenericFallback?: (punishmentData: TPunishment) => EventTypes | false;

  /**
   * Optional formatter for ISO-8601 date strings (e.g. punishment end dates).
   * Should return a user-facing localized date string. When omitted the
   * package falls back to its built-in formatter. Hosts typically provide
   * this to match their own date-formatting conventions (locale, time zone,
   * long vs. short form).
   */
  formatFullDate?: (isoDate: string) => string;

  /**
   * Called when the NAP dialog is rendered inside the Safety Dashboard and the user clicks an
   * appeals link. The host should navigate to the supplied violation UID when present and fall back
   * to the violations list instead of opening an external URL.
   */
  onAppealsRedirect?: (violationUid?: string) => void;

  /**
   * When true, enables a simplified, read-only presentation intended for contexts
   * where the user is viewing their punishment status without the full interactive
   * reactivation flow.
   *
   * Replaces the logout menu with an inline close button, skips second-chance pages,
   * and renders a simplified "OK" CTA on the final page.
   *
   * Also suppresses ALL not-approved-page analytics events: read-only usage is
   * informational/preview only (e.g. the safety dashboard) and should not dilute
   * real-violation metrics.
   */
  readOnly?: boolean;
}
