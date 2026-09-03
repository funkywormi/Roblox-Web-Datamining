import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import { fireEvent } from "roblox-event-tracker";
import { APICall, Feature, fireErrorCounter } from "../utils/apiEventsCounter";
import {
  initiatePhoneVerificationSession,
  verifyPhoneVerificationSession,
} from "../services/robuxPhoneVerificationService";
import { PhonePrefix } from "../services/phonePrefixService";
import { COUNTER_METRICS } from "../constants/Constants";
import useGiftingAnalytics from "./useGiftingAnalytics";

export enum RobuxPhoneVerificationStep {
  PhoneNumber = "PhoneNumber",
  AuthenticationCode = "AuthenticationCode",
}

export type UseRobuxPhoneVerificationResult = {
  phoneVerificationStep: RobuxPhoneVerificationStep;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  authenticationCode: string;
  setAuthenticationCode: Dispatch<SetStateAction<string>>;
  phonePrefixes: PhonePrefix[];
  phonePrefixIndex: number;
  setPhonePrefixIndex: Dispatch<SetStateAction<number>>;
  submitPhoneNumber: () => void;
  submitAuthenticationCode: () => void;
  changeNumber: () => void;
  error: string | undefined;
  isSubmitting: boolean;
  onExitModal: (sessionId: string | null) => void;
};

export default function useRobuxPhoneVerification(
  onClose: (phoneVerificationSessionId: string | null) => void,
): UseRobuxPhoneVerificationResult {
  const [phoneVerificationStep, setPhoneVerificationStep] = useState<RobuxPhoneVerificationStep>(
    RobuxPhoneVerificationStep.PhoneNumber,
  );
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [authenticationCode, setAuthenticationCode] = useState<string>("");
  const [phonePrefixes] = useState<PhonePrefix[]>([]);
  const [phonePrefixIndex, setPhonePrefixIndex] = useState(0);
  const [phoneVerificationSessionId, setPhoneVerificationSessionId] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { trackAuthenticatePhoneNumber, trackSubmitPhoneNumber } = useGiftingAnalytics();

  const phonePrefix = useMemo(
    () => phonePrefixes[phonePrefixIndex],
    [phonePrefixes, phonePrefixIndex],
  );

  const prefix = phonePrefix?.prefix ?? "1";
  const countryCodeISO = phonePrefix?.code ?? "US";

  const onExitModal = useCallback(
    (sessionId: string | null) => {
      setPhoneNumber("");
      setAuthenticationCode("");
      setPhoneVerificationSessionId("");
      setError(undefined);
      setPhoneVerificationStep(RobuxPhoneVerificationStep.PhoneNumber);
      onClose(sessionId);
    },
    [onClose],
  );

  const submitPhoneNumber = useCallback(async () => {
    try {
      setError(undefined);
      setIsSubmitting(true);

      trackSubmitPhoneNumber();
      const {
        data: { phoneVerificationSessionId: sessionId },
      } = await initiatePhoneVerificationSession(prefix, countryCodeISO, phoneNumber);

      setPhoneVerificationSessionId(sessionId);
      setPhoneVerificationStep(RobuxPhoneVerificationStep.AuthenticationCode);
    } catch (err) {
      const errorStatus =
        err instanceof Object && "status" in err && typeof err.status === "number"
          ? err.status
          : undefined;

      switch (errorStatus) {
        case 400:
          setError("Message.PhoneVerification.BadPhoneNumber");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_SEND_400);
          break;
        case 429:
          setError("Message.PhoneVerification.TryAgainLater");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_SEND_429);
          break;
        case 500:
        case undefined:
        default:
          setError("Message.PhoneVerification.TryAgainLaterError");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_SEND_500);
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [prefix, countryCodeISO, phoneNumber, trackSubmitPhoneNumber]);

  const submitAuthenticationCode = useCallback(async () => {
    try {
      setError(undefined);
      setIsSubmitting(true);

      trackAuthenticatePhoneNumber();
      await verifyPhoneVerificationSession(phoneVerificationSessionId, authenticationCode);
      onExitModal(phoneVerificationSessionId);
    } catch (err) {
      const errorStatus =
        err instanceof Object && "status" in err && typeof err.status === "number"
          ? err.status
          : undefined;
      fireErrorCounter(
        Feature.ROBUX_GIFTING,
        APICall.VERIFY_PHONE_VERIFICATION_SESSION,
        errorStatus,
      ).catch(() => undefined);

      switch (errorStatus) {
        case 401:
          setError("Message.PhoneVerification.BadAuthenticationCode");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_VERIFY_401);
          break;
        case 403:
          setError("Message.PhoneVerification.AuthenticationCodeInvalid");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_VERIFY_403);
          break;
        case 429:
          setError("Message.PhoneVerification.TryAgainLaterError");
          break;
        case 500:
        case undefined:
        default:
          setError("Message.PhoneVerification.TryAgainLaterError");
          fireEvent(COUNTER_METRICS.PHONE_VERIFICATION_SESSION_VERIFY_500);
          break;
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [phoneVerificationSessionId, authenticationCode, onExitModal, trackAuthenticatePhoneNumber]);

  const changeNumber = useCallback(() => {
    setAuthenticationCode("");
    setPhoneVerificationSessionId("");
    setError(undefined);
    setPhoneVerificationStep(RobuxPhoneVerificationStep.PhoneNumber);
  }, []);

  const handleSetPhoneNumber = useCallback((number: string) => {
    const matches = /[0-9]*/.exec(number);
    if (matches) {
      setPhoneNumber(matches.join(""));
    }
  }, []);

  // re-enable if we're ready for non-US phone numbers
  // useEffect(() => {
  //   // eslint-disable-next-line no-void
  //   void getPhonePrefixes().then((prefixes: PhonePrefix[]) => {
  //     if (prefixes.length > 0) {
  //       setPhonePrefixes(prefixes);
  //     }
  //   });
  // }, []);

  return {
    phoneVerificationStep,
    phoneNumber,
    setPhoneNumber: handleSetPhoneNumber,
    authenticationCode,
    setAuthenticationCode,
    phonePrefixes,
    phonePrefixIndex,
    setPhonePrefixIndex,
    error,
    isSubmitting,

    submitPhoneNumber: () => {
      submitPhoneNumber().catch(() => undefined);
    },
    submitAuthenticationCode: () => {
      submitAuthenticationCode().catch(() => undefined);
    },
    changeNumber,
    onExitModal,
  };
}
