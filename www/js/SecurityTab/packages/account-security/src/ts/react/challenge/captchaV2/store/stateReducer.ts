import { CaptchaV2Action, CaptchaV2ActionType } from "./action";
import { CaptchaV2State } from "./state";

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const captchaV2StateReducer = (
  oldState: CaptchaV2State,
  action: CaptchaV2Action,
): CaptchaV2State => {
  const newState = { ...oldState };
  switch (action.type) {
    case CaptchaV2ActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case CaptchaV2ActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case CaptchaV2ActionType.SET_CHALLENGE_ABANDONED:
      newState.isAbandoned = true;
      return newState;
    case CaptchaV2ActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case CaptchaV2ActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default captchaV2StateReducer;
