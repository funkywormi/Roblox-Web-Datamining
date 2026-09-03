import { OnChallengeCompletedData, OnChallengeInvalidatedData } from "../interface";

export enum TurnstileActionType {
  SET_CHALLENGE_COMPLETED,
  SET_CHALLENGE_INVALIDATED,
  SET_CHALLENGE_ABANDONED,
  HIDE_MODAL_CHALLENGE,
  SHOW_MODAL_CHALLENGE,
}

export type TurnstileAction =
  | {
      type: TurnstileActionType.SET_CHALLENGE_COMPLETED;
      onChallengeCompletedData: OnChallengeCompletedData;
    }
  | {
      type: TurnstileActionType.SET_CHALLENGE_INVALIDATED;
      onChallengeInvalidatedData: OnChallengeInvalidatedData;
    }
  | {
      type: TurnstileActionType.SET_CHALLENGE_ABANDONED;
    }
  | {
      type: TurnstileActionType.SHOW_MODAL_CHALLENGE;
    }
  | {
      type: TurnstileActionType.HIDE_MODAL_CHALLENGE;
    };
