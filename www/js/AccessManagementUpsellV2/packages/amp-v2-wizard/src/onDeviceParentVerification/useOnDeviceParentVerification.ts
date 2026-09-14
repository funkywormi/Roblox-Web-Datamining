/**
 * Runs one Persona check against an on-device-parent session and reports how the vendor stage ended.
 *
 * Does not report verdict of the age verification; Owns the vendor SDK lifecycle and nothing else.
 * The verdict of the age verification will be observed through the `SessionPolling` instead.
 */

import { Client as PersonaClient } from "persona";
import { useEffect, useRef, useState } from "react";
import Intl from "@rbx/core-scripts/intl";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { useTheme } from "@rbx/core-scripts/react";

import { startOnDeviceParentVerification } from "./api";
import openVerificationLink from "../utils/verificationUtils";
import {
  VendorSessionFailure,
  VendorOutcome,
  type OnDeviceParentVerificationMethod,
  type StartOnDeviceParentVerificationResponse,
  type VendorSessionResult,
} from "./types";

export type UseOnDeviceParentVerificationOptions = {
  /** The odp sessionId the check is associated with. */
  sessionId: string;
  method: OnDeviceParentVerificationMethod;
  onSettled: (result: VendorSessionResult) => void;
};

export type OnDeviceParentVerification = {
  isLoading: boolean;
};

export function useOnDeviceParentVerification(
  options: UseOnDeviceParentVerificationOptions,
): OnDeviceParentVerification {
  const { sessionId, method, onSettled } = options;

  const [isLoading, setIsLoading] = useState(true);

  const styleVariant = useTheme();

  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  const styleVariantRef = useRef(styleVariant);
  styleVariantRef.current = styleVariant;

  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return undefined;
    }
    startedRef.current = true;

    let disposed = false;
    let settled = false;
    let personaClient: PersonaClient | null = null;

    const settle = (result: VendorSessionResult) => {
      if (settled || disposed) {
        return;
      }
      settled = true;
      setIsLoading(false);
      onSettledRef.current(result);
    };

    const startEmbedded = (inquiryId: string) => {
      const locale = new Intl().getLocale();
      personaClient = new PersonaClient({
        inquiryId,
        styleVariant: styleVariantRef.current,
        ...(locale && { language: locale }),
        onReady: () => {
          personaClient?.open();
          setIsLoading(false);
        },
        onComplete: () => {
          settle({ outcome: VendorOutcome.Submitted });
        },
        onCancel: () => {
          settle({ outcome: VendorOutcome.Cancelled });
        },
        onError: () => {
          settle({ outcome: VendorOutcome.Failed, failure: VendorSessionFailure.VendorError });
        },
      });
    };

    const startHosted = (started: StartOnDeviceParentVerificationResponse) => {
      if (started.verificationLink == null) {
        settle({ outcome: VendorOutcome.Failed, failure: VendorSessionFailure.StartFailed });
        return;
      }
      openVerificationLink(started.verificationLink, styleVariantRef.current);
    };

    const isWebview = getDeviceMeta()?.isInApp ?? false;
    if (!isWebview) {
      PersonaClient.preload().catch(() => undefined);
    }

    // An effect callback cannot be async, so the await lives in a local one.
    const startCheck = async () => {
      try {
        const started = await startOnDeviceParentVerification(sessionId, method);
        if (disposed) {
          return;
        }
        const inquiryId = started.sessionIdentifier;
        if (inquiryId == null) {
          settle({ outcome: VendorOutcome.Failed, failure: VendorSessionFailure.StartFailed });
          return;
        }
        if (isWebview) {
          startHosted(started);
        } else {
          startEmbedded(inquiryId);
        }
      } catch {
        settle({ outcome: VendorOutcome.Failed, failure: VendorSessionFailure.StartFailed });
      }
    };

    // Nothing above rejects, so this only guards against onSettled itself throwing.
    startCheck().catch(() => undefined);

    return () => {
      disposed = true;
      personaClient?.destroy();
      personaClient = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading };
}
