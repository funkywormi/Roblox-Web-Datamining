import React, { useEffect, useRef, useState } from "react";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { EnvironmentUrls } from "@rbx/environment-urls";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import * as pubSub from "@rbx/www-common/cross-tab-communication/pubsub";
import BirthdayComplianceModal from "@rbx/authentication-common/components/BirthdayComplianceModal";
import {
  completeSsoAttempt,
  failSsoAttempt,
  sendSsoClientErrorEvent,
  ssoClientErrorReasons,
  watchOtherTabSsoAttempts,
  type SsoAttempt,
  type SsoClientErrorReason,
} from "../services/ssoTelemetryService";
import { handlePostSignup } from "../../reactLanding/utils/signupUtils";

/* Must stay in sync with the event names in components/ssoComplete/entry.ts. */
const SSO_COMPLETE_EVENT = "ssoComplete";
const SSO_FAILED_EVENT = "ssoFailed";
const SSO_COMPLETE_SUBSCRIBER_NAMESPACE = "sharedSsoComplete";

/* Source of truth is the useraccess restriction proto enum; 7 is BirthdayCompliance. */
const BIRTHDAY_COMPLIANCE_SOURCE = 7;

/* Bounds how long an abandoned attempt (popup closed, nothing sent back) can still claim a later
 * signup message. */
const SSO_SIGNUP_MAX_ATTEMPT_AGE_MS = 30 * 60 * 1000;

type NotApprovedResponse = { restriction: { source: number } | null };

type AuthenticatedUserResponse = { name: string | null };

type AuthenticatedUserIdResponse = { id: number };

/* Pre-auth pages are server-rendered without a session, so <meta name="user-data"> is empty and
 * authenticatedUser() returns null; the fresh session cookie from the popup works with
 * the users API, so the username for the birthday-compliance form is fetched instead.
 * /authenticated is blocked for moderated users, but /app-launch-info bypasses the
 * moderation filter (same endpoint the app client uses at login) and still carries name. */
const fetchAuthenticatedUsername = (): Promise<string | null> =>
  httpService
    .get<AuthenticatedUserResponse>({
      url: `${EnvironmentUrls.usersApi}/v1/users/authenticated/app-launch-info`,
      withCredentials: true,
    })
    .then(({ data }) => data.name ?? null);

/* Runs once any birthday-compliance upgrade has cleared, so the moderation filter on
 * /authenticated no longer applies. */
const fetchAuthenticatedUserId = (): Promise<string> =>
  httpService
    .get<AuthenticatedUserIdResponse>({
      url: `${EnvironmentUrls.usersApi}/v1/users/authenticated`,
      withCredentials: true,
    })
    .then(({ data }) => String(data.id));

const isSsoMessage = (data: unknown, msg: string): boolean =>
  typeof data === "object" && data !== null && (data as { msg?: unknown }).msg === msg;

/* Missing for login, for auth-api builds before roblox-authentication#1808, and for
 * sso-complete bundles that predate the field. */
const isSignupMessage = (data: unknown): boolean =>
  (data as { ssoType?: unknown }).ssoType === "signup";

/* `sso-type` comes from the popup's URL and the message reaches every open tab, so only the tab
 * that started this attempt treats it as a new account. */
const isRecentOwnAttempt = (attempt: SsoAttempt | undefined): attempt is SsoAttempt =>
  attempt !== undefined && Date.now() - attempt.startedAt <= SSO_SIGNUP_MAX_ATTEMPT_AGE_MS;

type SsoCompleteHandlerProps = {
  /** Leaves the host page for its validated `returnUrl`, as its password flow does. */
  navigateToDestination: () => void;
  /** Where a new SSO account lands; `handlePostSignup` marks it as a new user. */
  getSignupReturnUrl: () => string;
};

/**
 * Listens for the sso-complete popup's handoff message. On receipt, checks the user's
 * not-approved restriction: a birthday-compliance restriction renders the upgrade modal over
 * the host page, which navigates to the destination once the upgrade clears; anything else
 * navigates there right away. The popup leaves the host page loaded, so its `returnUrl` is
 * still in the query string. Also runs the same check on mount when the visitor is already
 * authenticated (e.g. the SSO completed but the upgrade never happened and the user landed
 * back on the login or signup page). A failure message from the popup's error page only
 * reports the attempt; the popup shows the error itself. When the handshake created the account,
 * leaving runs the password flow's post-signup steps instead.
 */
const SsoCompleteHandler = ({
  navigateToDestination,
  getSignupReturnUrl,
}: SsoCompleteHandlerProps): React.JSX.Element | null => {
  const [showBirthdayCompliance, setShowBirthdayCompliance] = useState(false);
  const [username, setUsername] = useState<string>();
  const leaveRef = useRef(navigateToDestination);

  const completeSignup = (attempt: SsoAttempt): void => {
    fetchAuthenticatedUserId()
      .catch(() => {
        sendSsoClientErrorEvent(
          attempt.ctx,
          attempt.provider,
          ssoClientErrorReasons.userIdFetchFailed,
        );
        return undefined;
      })
      .then(userId => handlePostSignup(getSignupReturnUrl(), userId))
      .catch(error => {
        console.warn("[SsoCompleteHandler] post-signup failed:", error);
        navigateToDestination();
      });
  };

  const checkNotApproved = (isInitialLoad: boolean, attempt?: SsoAttempt): void => {
    const sendClientError = (reason: SsoClientErrorReason): void => {
      if (attempt) {
        sendSsoClientErrorEvent(attempt.ctx, attempt.provider, reason);
      }
    };
    httpService
      .get<NotApprovedResponse>({
        url: `${EnvironmentUrls.userModerationApi}/v2/not-approved`,
        withCredentials: true,
      })
      .then(({ data: notApproved }) => {
        if (notApproved.restriction?.source === BIRTHDAY_COMPLIANCE_SOURCE) {
          fetchAuthenticatedUsername()
            .then(fetchedUsername => {
              setUsername(fetchedUsername ?? undefined);
              setShowBirthdayCompliance(true);
            })
            .catch(() => {
              sendClientError(ssoClientErrorReasons.usernameFetchFailed);
              setShowBirthdayCompliance(true);
            });
        } else if (!isInitialLoad) {
          leaveRef.current();
        }
      })
      .catch(error => {
        sendClientError(ssoClientErrorReasons.notApprovedFetchFailed);
        console.warn("[SsoCompleteHandler] not-approved fetch failed:", error);
        if (!isInitialLoad) {
          leaveRef.current();
        }
      });
  };

  useEffect(() => {
    // An authenticated visitor landing on the host page may carry an uncleared
    // birthday-compliance restriction; check without redirecting on a clean result.
    if (authenticatedUser?.isAuthenticated) {
      checkNotApproved(true);
    }

    // The OAuth redirect chain (Google/Apple) severs window.opener (their pages set
    // Cross-Origin-Opener-Policy: same-origin), so the popup signals completion over the
    // shared localStorage pubSub (@rbx/www-common cross-tab communication) instead of
    // opener.postMessage. The event name must stay in sync with
    // components/ssoComplete/entry.ts. publish() removes the key before setting it, so
    // the removal also fires a storage event with a null payload — only a parseable
    // ssoComplete message counts.
    pubSub.subscribe(SSO_COMPLETE_EVENT, SSO_COMPLETE_SUBSCRIBER_NAMESPACE, newValue => {
      if (newValue == null) {
        return;
      }
      try {
        const message: unknown = JSON.parse(newValue);
        if (isSsoMessage(message, SSO_COMPLETE_EVENT)) {
          const attempt = completeSsoAttempt();
          leaveRef.current =
            isSignupMessage(message) && isRecentOwnAttempt(attempt)
              ? () => completeSignup(attempt)
              : navigateToDestination;
          checkNotApproved(false, attempt);
        }
      } catch {
        // Malformed payload; the storage write is best-effort signaling only.
      }
    });

    pubSub.subscribe(SSO_FAILED_EVENT, SSO_COMPLETE_SUBSCRIBER_NAMESPACE, newValue => {
      if (newValue == null) {
        return;
      }
      try {
        if (isSsoMessage(JSON.parse(newValue), SSO_FAILED_EVENT)) {
          failSsoAttempt();
        }
      } catch {
        // Malformed payload; the storage write is best-effort signaling only.
      }
    });

    const stopWatchingOtherTabSsoAttempts = watchOtherTabSsoAttempts();

    return () => {
      pubSub.unsubscribe(SSO_COMPLETE_EVENT, SSO_COMPLETE_SUBSCRIBER_NAMESPACE);
      pubSub.unsubscribe(SSO_FAILED_EVENT, SSO_COMPLETE_SUBSCRIBER_NAMESPACE);
      stopWatchingOtherTabSsoAttempts();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only subscription; the callbacks close over state setters, a ref, and the host's stable navigation props
  }, []);

  if (!showBirthdayCompliance) {
    return null;
  }
  return (
    <BirthdayComplianceModal
      initialUsername={username}
      navigateAfterUpgrade={() => leaveRef.current()}
    />
  );
};

export default SsoCompleteHandler;
