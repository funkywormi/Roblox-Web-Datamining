import { OnChallengeCompletedData, OnChallengeInvalidatedData } from "../interface";

export enum CaptchaV2ActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  SET_CHALLENGE_ABANDONED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE,
}

export type CaptchaV2Action =
  | {
      type: CaptchaV2ActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: CaptchaV2ActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: CaptchaV2ActionType.SET_CHALLENGE_ABANDONED;
    }
  | {
      type: CaptchaV2ActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: CaptchaV2ActionType.HIDE_MODAL_CHALLENGE;
    };
