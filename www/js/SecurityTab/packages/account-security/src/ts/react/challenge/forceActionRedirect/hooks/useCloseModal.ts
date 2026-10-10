import { ForceActionRedirectActionType } from "../store/action";
import useForceActionRedirectContext from "./useForceActionRedirectContext";

/**
 * Returns a handler that hides the modal and reports the abandon, handing the modal caller a
 * way to restore it.
 */
const useCloseModal = (): (() => void) => {
  const {
    state: { onModalChallengeAbandoned, onChallengeAbandoned },
    dispatch,
  } = useForceActionRedirectContext();

  return () => {
    dispatch({
      type: ForceActionRedirectActionType.HIDE_MODAL_CHALLENGE,
    });
    if (onModalChallengeAbandoned !== null) {
      onModalChallengeAbandoned(() =>
        dispatch({
          type: ForceActionRedirectActionType.SHOW_MODAL_CHALLENGE,
        }),
      );
    }

    // In-line webview abandon support.
    if (onChallengeAbandoned !== null) {
      onChallengeAbandoned();
    }
  };
};

export default useCloseModal;
