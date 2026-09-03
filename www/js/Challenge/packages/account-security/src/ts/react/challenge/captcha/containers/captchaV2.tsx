import environmentUrls from "@rbx/environment-urls";
import React, { useCallback, useEffect, useRef, useState } from "react";
import InlineChallenge from "../../../common/inlineChallenge";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import {
  EVENT_CONSTANTS,
  FUNCAPTCHA_PUBLIC_KEY_MAP,
  FUNCAPTCHA_VERSION_V2,
  LOG_PREFIX,
} from "../app.config";
import useCaptchaContext from "../hooks/useCaptchaContext";
import { ErrorCode } from "../interface";
import { CaptchaReducerActionType } from "../store/action";
import ArkoseIframeInlineShim from "./arkoseIframeInlineShim";
import { CaptchaElementEvent, CaptchaElementEventId } from "./captchaElementEvent";

/*
 * Visible Captcha Override Control
 */

const QUERY_KEY_FC_NOSUPPRESS = "fc_nosuppress" as const;
const queryParameterFcNosuppress =
  window.URLSearchParams === undefined
    ? null
    : new URLSearchParams(window.location.search).get(QUERY_KEY_FC_NOSUPPRESS);
const QUERY_KEY_FC_SUPPRESS = "fc_suppress" as const;
const queryParameterFcSuppress =
  window.URLSearchParams === undefined
    ? null
    : new URLSearchParams(window.location.search).get(QUERY_KEY_FC_SUPPRESS);
const queryStringToPropagate =
  // eslint-disable-next-line no-nested-ternary
  queryParameterFcNosuppress !== null
    ? `&${QUERY_KEY_FC_NOSUPPRESS}=${queryParameterFcNosuppress}`
    : queryParameterFcSuppress !== null
      ? `&${QUERY_KEY_FC_SUPPRESS}=${queryParameterFcSuppress}`
      : "";
const queryParametersToPropagate = {
  [QUERY_KEY_FC_NOSUPPRESS]: queryParameterFcNosuppress || undefined,
  [QUERY_KEY_FC_SUPPRESS]: queryParameterFcSuppress || undefined,
};

const ARKOSE_SITETEST_DOMAINS: readonly string[] = [
  "sitetest1.robloxlabs.com",
  "sitetest2.robloxlabs.com",
  "sitetest3.robloxlabs.com",
];

const ARKOSE_SCRIPT_HOST = ARKOSE_SITETEST_DOMAINS.includes(environmentUrls.domain)
  ? `arkoselabs.${environmentUrls.domain}`
  : "arkoselabs.roblox.com";

const ARKOSE_ORIGIN = `https://${ARKOSE_SCRIPT_HOST}`;

// Origins allowed to deliver `CaptchaElementEvent` messages to our `message`
// listener. This is defense-in-depth for our own listener only: it does NOT
// affect the Arkose-hosted challenge frame, which is responsible for
// validating the messages it receives from its parent.
const TRUSTED_MESSAGE_ORIGINS: ReadonlySet<string> = new Set(
  [
    // Same-origin (legacy same-origin captcha iframe, if any).
    typeof window !== "undefined" ? window.location.origin : "",
    // The Arkose FunCaptcha challenge origin (env-specific).
    ARKOSE_ORIGIN,
  ].filter(Boolean),
);

// An instance counter for this component used to route messages from an Arkose
// `iframe` to the instance that spawned it.
let nextArkoseIframeId = 0;

/**
 * A container element for the Captcha V2 UI.
 */
const CaptchaV2: React.FC = () => {
  const {
    state: {
      actionType,
      dataExchangeBlob,
      unifiedCaptchaId,
      captchaVersion,
      renderInline,
      resources,
      metadataResponse,
      eventService,
      metricsService,
      onChallengeDisplayed,
      onModalChallengeAbandoned,
      isModalVisible,
    },
    dispatch,
  } = useCaptchaContext();
  /*
   * Component State
   */

  const [arkoseIframeId] = useState<string>(() => {
    const id = nextArkoseIframeId;
    nextArkoseIframeId += 1;
    return id.toString();
  });
  const [publicKey, setPublicKey] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [gotActiveCaptcha, setGotActiveCaptcha] = useState<boolean>(false);
  const [captchaElementListenerReady, setCaptchaElementListenerReady] = useState<boolean>(false);
  const challengeDone = useRef<boolean>(false);
  const solveStartTimestamp = useRef<number | null>(null);
  const captchaElementIframe = useRef<HTMLIFrameElement>(null);
  const captchaElementIframeShim = useRef<HTMLDivElement>(null);

  /*
   * Event Handlers
   */

  const closeModal = useCallback(() => {
    // Mutually-exclusive with other completion handlers.
    if (challengeDone.current) {
      return;
    }
    challengeDone.current = true;
    dispatch({
      type: CaptchaReducerActionType.HIDE_MODAL_CHALLENGE,
    });
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE,
        }),
      );
    }
  }, [dispatch, onModalChallengeAbandoned]);

  const onComplete = useCallback(
    (captchaToken: string, captchaId: string) => {
      // Mutually-exclusive with other completion handlers.
      if (challengeDone.current) {
        return;
      }
      challengeDone.current = true;
      dispatch({
        type: CaptchaReducerActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: { captchaToken, captchaId },
      });
    },
    [dispatch],
  );

  const onError = useCallback(() => {
    // Mutually-exclusive with other completion handlers.
    if (challengeDone.current) {
      return;
    }
    challengeDone.current = true;
    dispatch({
      type: CaptchaReducerActionType.SET_CHALLENGE_INVALIDATED,
      errorCode: ErrorCode.UNKNOWN,
    });
  }, [dispatch]);

  const onShown = useCallback(() => {
    setPageLoading(false);
    dispatch({
      type: CaptchaReducerActionType.SHOW_MODAL_CHALLENGE,
    });
    setGotActiveCaptcha(true);
    onChallengeDisplayed({ displayed: true });
    solveStartTimestamp.current = Date.now();
  }, [dispatch, onChallengeDisplayed]);

  /*
   * Effects
   */

  // Challenge loading effect:
  useEffect(() => {
    setPageLoading(true);

    // Use metadata to select the right Arkose key for our current action type.
    const { funCaptchaPublicKeys } = metadataResponse;
    const publicKeyName = FUNCAPTCHA_PUBLIC_KEY_MAP[actionType];
    setPublicKey(funCaptchaPublicKeys[publicKeyName] || "");
    metricsService.fireTriggeredEvent();
  }, [actionType, metadataResponse, metricsService]);

  // Shared handler thunk between the previous `iframe` implementation (which
  // `postMessage`s in this format) and the new inline shim, which receives
  // this handler thunk as one of its props. Note that this thunk may be
  // invoked in a different order than messages are published; any mutations
  // of shared should take this possibility into account.
  const handleCaptchaElementEvent = useCallback(
    (captchaElementEvent: CaptchaElementEvent) => {
      // Ensure that we only receive messages from the FunCaptcha instance
      // spawned by this component. (Even though we clean up event listeners
      // when unmounting the component, the default behavior when a user clicks
      // the `X` button is to hide the modal and allow the spawning consumer to
      // simply re-open the challenge. In these instances, the component is not
      // truly unmounted, and in any case, we do not want multiple captcha
      // instances to conflict with each other via event handler globals).
      if (captchaElementEvent.arkoseIframeId !== arkoseIframeId) {
        return;
      }
      switch (captchaElementEvent.eventId) {
        case CaptchaElementEventId.ChallengeComplete: {
          onComplete(captchaElementEvent.payload.captchaToken, unifiedCaptchaId);
          metricsService.fireSuccessEvent();
          let solveDuration = 0;
          if (solveStartTimestamp.current) {
            solveDuration = Date.now() - solveStartTimestamp.current;
          }
          eventService.sendCaptchaRedeemEvent(
            actionType,
            solveDuration,
            true,
            captchaElementEvent.payload.captchaToken,
            unifiedCaptchaId,
            FUNCAPTCHA_VERSION_V2,
          );
          break;
        }
        case CaptchaElementEventId.ChallengeError:
          challengeDone.current = true;
          onError();
          metricsService.fireProviderErrorEvent();
          eventService.sendCaptchaInitiatedEvent(
            actionType,
            EVENT_CONSTANTS.captchaInitiatedChallengeType.error,
            captchaElementEvent.payload.captchaToken || "",
            unifiedCaptchaId,
            captchaElementEvent.payload.error,
            FUNCAPTCHA_VERSION_V2,
          );
          break;
        case CaptchaElementEventId.ChallengeShown:
          onShown();
          metricsService.fireDisplayedEvent();
          eventService.sendCaptchaInitiatedEvent(
            actionType,
            EVENT_CONSTANTS.captchaInitiatedChallengeType.visible,
            captchaElementEvent.payload.captchaToken,
            unifiedCaptchaId,
            null,
            FUNCAPTCHA_VERSION_V2,
          );
          break;
        case CaptchaElementEventId.ChallengeResize:
          if (captchaElementIframe.current !== null) {
            captchaElementIframe.current.height = captchaElementEvent.payload.height;
            captchaElementIframe.current.width = captchaElementEvent.payload.width;
          }
          if (captchaElementIframeShim.current !== null) {
            captchaElementIframeShim.current.style.height = captchaElementEvent.payload.height;
            captchaElementIframeShim.current.style.width = captchaElementEvent.payload.width;
          }
          break;
        case CaptchaElementEventId.ChallengeSuppressed:
          metricsService.fireSuppressedEvent();
          eventService.sendCaptchaInitiatedEvent(
            actionType,
            EVENT_CONSTANTS.captchaInitiatedChallengeType.hidden,
            captchaElementEvent.payload.captchaToken,
            unifiedCaptchaId,
            null,
            FUNCAPTCHA_VERSION_V2,
          );
          break;
        case CaptchaElementEventId.ChallengeReady:
          metricsService.fireInitializedEvent();
          break;
        case CaptchaElementEventId.ChallengeHidden:
          closeModal();
          break;
        default:
          break;
      }
    },
    // Do NOT add mutable component state dependencies here; this listener
    // effect should remain stable since it is passed to a child component that
    // should not re-render unless broader context changes. Use a `ref` or
    // other stable reference instead if necessary.
    [
      actionType,
      arkoseIframeId,
      closeModal,
      eventService,
      metricsService,
      onComplete,
      onError,
      onShown,
      unifiedCaptchaId,
    ],
  );

  // Effect that sets up an `iframe` listener for the Arkose `iframe` (and
  // tears down when the wrapper component is unmounted). This is not strictly
  // necessary for the `iframe` shim (which receives its event handler thunk
  // directly).
  useEffect(() => {
    const arkoseIframeListener = (event: MessageEvent) => {
      // Reject cross-origin messages before doing any parsing. A malicious page
      // that frames us (or that we frame) must not be able to spoof captcha
      // lifecycle events. Also drop messages the window posts to itself, which
      // are never a legitimate source for these events.
      if (!TRUSTED_MESSAGE_ORIGINS.has(event.origin) || event.source === window) {
        return;
      }
      try {
        const captchaElementEvent: CaptchaElementEvent = JSON.parse(
          event.data,
        ) as CaptchaElementEvent;
        // Validation sanity check (in case anything else on the page is using
        // the `postMessage` API). If the object has the `arkoseIframeId` prop
        // then we assume that it is from the Arkose `iframe`.
        if (!Object.prototype.hasOwnProperty.call(captchaElementEvent, "arkoseIframeId")) {
          return;
        }
        handleCaptchaElementEvent(captchaElementEvent);
      } catch (error) {
        // `SyntaxError` is expected if `JSON.parse` fails, which happens if the
        // Arkose API code posts extraneous messages.
        if (error instanceof SyntaxError) {
          return;
        }
        metricsService.fireProviderErrorEvent();
        // eslint-disable-next-line no-console
        console.error(LOG_PREFIX, "Got bad event data:", event.data);
        eventService.sendCaptchaInitiatedEvent(
          actionType,
          EVENT_CONSTANTS.captchaInitiatedChallengeType.error,
          null,
          unifiedCaptchaId,
          String(error),
          FUNCAPTCHA_VERSION_V2,
        );
      }
    };

    window.addEventListener("message", arkoseIframeListener);
    setCaptchaElementListenerReady(true);
    return () => {
      setCaptchaElementListenerReady(false);
      window.removeEventListener("message", arkoseIframeListener);
    };
    // Do NOT add mutable component state dependencies here; this listener
    // effect should remain stable so as not to lose asynchronous messages
    // during re-renders.  Use a `ref` or other stable reference instead if
    // necessary.
  }, [actionType, eventService, handleCaptchaElementEvent, metricsService, unifiedCaptchaId]);

  /*
   * Render Properties
   */

  // The `captchaBody` is displayed conditionally on setting up our event
  // listener. Once visible, the `iframe` (or an equivalent shim) should take
  // up as much of its parent as it can without exceeding its parent's size.
  const captchaBody = (
    <div className="challenge-captcha-body">
      <ArkoseIframeInlineShim
        arkoseIframeId={arkoseIframeId}
        dataExchangeBlob={dataExchangeBlob}
        handleCaptchaElementEvent={handleCaptchaElementEvent}
        publicKey={publicKey}
        queryParameters={queryParametersToPropagate}
        ref={captchaElementIframeShim}
        useArkoseModal={!renderInline}
      />
    </div>
  );

  /*
   * Component Markup
   */

  if (renderInline) {
    return (
      <InlineChallenge titleText={resources.Description.VerifyingYouAreNotBot}>
        <InlineChallengeBody>
          {(pageLoading || !captchaElementListenerReady) && (
            <span className="spinner spinner-default spinner-no-margin challenge-captcha-body" />
          )}
          {captchaElementListenerReady && captchaBody}
        </InlineChallengeBody>
      </InlineChallenge>
    );
  }

  // Non-inline; use Arkose modal wrapper.
  return captchaBody;
};

export default CaptchaV2;
