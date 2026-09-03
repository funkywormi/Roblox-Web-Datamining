import { TurnstileAction, TurnstileActionType } from "./action";
import { TurnstileState } from "./state";

// NOTE: Do not put side-effects with respect to the app state inside this
// reducer. Those should go in `contextProvider.tsx` as `useEffect` blocks.
const turnstileStateReducer = (
  oldState: TurnstileState,
  action: TurnstileAction,
): TurnstileState => {
  const newState = { ...oldState };
  switch (action.type) {
    case TurnstileActionType.SET_CHALLENGE_COMPLETED:
      newState.onChallengeCompletedData = action.onChallengeCompletedData;
      return newState;
    case TurnstileActionType.SET_CHALLENGE_INVALIDATED:
      newState.onChallengeInvalidatedData = action.onChallengeInvalidatedData;
      return newState;
    case TurnstileActionType.SET_CHALLENGE_ABANDONED:
      newState.isAbandoned = true;
      return newState;
    case TurnstileActionType.HIDE_MODAL_CHALLENGE:
      newState.isModalVisible = false;
      return newState;
    case TurnstileActionType.SHOW_MODAL_CHALLENGE:
      newState.isModalVisible = true;
      return newState;
    default:
      return oldState;
  }
};

export default turnstileStateReducer;
