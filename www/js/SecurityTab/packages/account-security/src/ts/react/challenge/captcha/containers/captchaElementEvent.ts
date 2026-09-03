export enum CaptchaElementEventId {
  ChallengeComplete = "challenge-complete",
  ChallengeError = "challenge-error",
  ChallengeSuppressed = "challenge-suppressed",
  ChallengeShown = "challenge-shown",
  ChallengeResize = "challenge-resize",
  ChallengeReady = "challenge-ready",
  ChallengeHidden = "challenge-hidden",
}

/**
 * The type of an event from the Arkose `iframe` (or its inline shim
 * equivalent).
 */
export type CaptchaElementEvent = {
  arkoseIframeId: string;
  sequenceNumber?: number;
} & (
  | {
      eventId: CaptchaElementEventId.ChallengeComplete;
      payload: {
        captchaToken: string;
      };
    }
  | {
      eventId: CaptchaElementEventId.ChallengeError;
      payload: {
        captchaToken?: string;
        error: string;
      };
    }
  | {
      eventId: CaptchaElementEventId.ChallengeSuppressed;
      payload: {
        captchaToken: string;
      };
    }
  | {
      eventId: CaptchaElementEventId.ChallengeShown;
      payload: {
        captchaToken: string;
      };
    }
  | {
      eventId: CaptchaElementEventId.ChallengeResize;
      payload: {
        width: string;
        height: string;
      };
    }
  | {
      eventId: CaptchaElementEventId.ChallengeReady;
    }
  | {
      eventId: CaptchaElementEventId.ChallengeHidden;
    }
);
