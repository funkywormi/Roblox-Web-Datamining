import environmentUrls from "@rbx/environment-urls";
import React, { Ref, useCallback, useEffect } from "react";
import { CaptchaElementEvent, CaptchaElementEventId } from "./captchaElementEvent";

const QUERY_KEY_FC_NOSUPPRESS = "fc_nosuppress" as const;
const QUERY_KEY_FC_SUPPRESS = "fc_suppress" as const;

const ARKOSE_SITETEST_DOMAINS: readonly string[] = [
  "sitetest1.robloxlabs.com",
  "sitetest2.robloxlabs.com",
  "sitetest3.robloxlabs.com",
];

const ARKOSE_SCRIPT_HOST = ARKOSE_SITETEST_DOMAINS.includes(environmentUrls.domain)
  ? `arkoselabs.${environmentUrls.domain}`
  : "arkoselabs.roblox.com";

type Props = {
  arkoseIframeId: string;
  dataExchangeBlob: string;
  handleCaptchaElementEvent: (event: CaptchaElementEvent) => void;
  nonce?: string;
  publicKey: string;
  queryParameters?: {
    // eslint-disable-next-line camelcase
    [QUERY_KEY_FC_NOSUPPRESS]?: string;
    // eslint-disable-next-line camelcase
    [QUERY_KEY_FC_SUPPRESS]?: string;
  };
  ref?: Ref<HTMLDivElement>;
  useArkoseModal: boolean;
};

type ArkoseEnforcementConfig = {
  selector: string;
  mode: "inline" | "lightbox";
  styleTheme: "Inline" | "modal";
  noSuppress: boolean;
  data: { blob: string };
  onCompleted: (response: { token: string }) => void;
  onError: (response: { token: string; error: { error: string } }) => void;
  onShown: (response: { token: string }) => void;
  onSuppress: (response: { token: string }) => void;
  onResize: (response: { width: string; height: string }) => void;
  onReady: () => void;
  onHide: () => void;
};

type ArkoseEnforcement = {
  setConfig(config: ArkoseEnforcementConfig): void;
  run(): void;
};

/**
 * A FunCaptcha component packaged as a normal (inline) React component.
 */
const ArkoseIframeInlineShim: React.FC<Props> = ({
  arkoseIframeId,
  dataExchangeBlob,
  handleCaptchaElementEvent,
  nonce,
  publicKey,
  queryParameters,
  ref,
  useArkoseModal,
}) => {
  const arkoseElementId = `arkose-${arkoseIframeId}`;
  const arkoseScriptId = `arkose-script-${publicKey}`;
  const setupEnforcementName = `setupEnforcement${arkoseIframeId}`;

  // Remove any existing scripts keyed by `arkoseScriptId`:
  const removeScript = useCallback(() => {
    const currentScript = document.getElementById(arkoseScriptId);
    if (currentScript) {
      currentScript.remove();
    }
  }, [arkoseScriptId]);

  // Add a new script keyed by `arkoseScriptId`:
  const loadScript = useCallback(() => {
    removeScript();
    const script = document.createElement("script");
    script.id = arkoseScriptId;
    script.type = "text/javascript";
    const publicKeySanitized = publicKey.replace(/[^a-zA-Z0-9-]+/g, "");
    script.src = `//${ARKOSE_SCRIPT_HOST}/v2/${publicKeySanitized}/api.js`;
    script.setAttribute("data-callback", setupEnforcementName);
    script.async = true;
    script.defer = true;
    if (nonce) {
      script.setAttribute("data-nonce", nonce);
    }
    document.body.appendChild(script);
    return script;
  }, [arkoseScriptId, nonce, publicKey, removeScript, setupEnforcementName]);

  // Arkose script callback to set up enforcement via `arkoseElementId`.
  const setupEnforcement = useCallback(
    (myEnforcement: ArkoseEnforcement) => {
      myEnforcement.setConfig({
        selector: `#${arkoseElementId}`,
        mode: useArkoseModal ? "lightbox" : "inline",
        styleTheme: useArkoseModal ? "modal" : "Inline",
        noSuppress: queryParameters?.fc_nosuppress === "1",
        data: {
          blob: dataExchangeBlob,
        },
        onCompleted(response) {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeComplete,
            payload: {
              captchaToken: response.token,
            },
          });
        },
        onError(response) {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeError,
            payload: {
              captchaToken: response.token,
              error: response.error.error,
            },
          });
        },
        onShown(response) {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeShown,
            payload: {
              captchaToken: response.token,
            },
          });
        },
        onSuppress(response) {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeSuppressed,
            payload: {
              captchaToken: response.token,
            },
          });
        },
        onResize(response) {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeResize,
            payload: {
              width: response.width,
              height: response.height,
            },
          });
        },
        onReady() {
          if (useArkoseModal) {
            myEnforcement.run();
          }
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeReady,
          });
        },
        onHide() {
          handleCaptchaElementEvent({
            arkoseIframeId,
            eventId: CaptchaElementEventId.ChallengeHidden,
          });
        },
      });
    },
    [
      arkoseElementId,
      arkoseIframeId,
      dataExchangeBlob,
      handleCaptchaElementEvent,
      queryParameters?.fc_nosuppress,
      useArkoseModal,
    ],
  );

  // Initialization effect.
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (window as any)[setupEnforcementName] = setupEnforcement;
    const scriptElement = loadScript();
    scriptElement.onerror = error => {
      // eslint-disable-next-line no-console
      console.log("Could not load the Arkose API Script!");
      // eslint-disable-next-line no-console
      console.error(error);
    };
  }, [loadScript, setupEnforcement, setupEnforcementName]);

  return <div ref={ref} style={useArkoseModal ? { display: "none" } : {}} id={arkoseElementId} />;
};

export default ArkoseIframeInlineShim;
