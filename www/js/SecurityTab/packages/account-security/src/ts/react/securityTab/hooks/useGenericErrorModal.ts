import { useCallback } from "react";
import useSecurityTabContext from "./useSecurityTabContext";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";

// Provides a reusable way to display error messages across security tab components
const useGenericErrorModal = () => {
  const { state, dispatch } = useSecurityTabContext();
  const { resources } = state;

  const showGenericErrorModal = useCallback(() => {
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.GENERIC_TEXT_ERROR,
      additionalModalProps: {
        title: resources.Heading.Dialog.DefaultError,
        body: resources.Response.Dialog.DefaultErrorMessage,
        button: resources.Action.Dialog.Success,
      },
    });
  }, [dispatch, resources]);

  return { showGenericErrorModal };
};

export default useGenericErrorModal;
