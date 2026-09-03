import { useCallback, useState } from "react";
import useSecurityTabContext from "./useSecurityTabContext";
import useDeleteAllSecurityKeys from "./useDeleteAllSecurityKeys";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";

export interface SecurityKeyWarningModalReturn {
  showWarningModal: (
    customMessage: string,
    options?: {
      skipDeletion?: boolean;
      onConfirm?: () => Promise<void>;
    },
  ) => void;
  pendingActionFunction: ((closeModal?: () => void) => Promise<void>) | null;
}

const useSecurityKeyWarningModal = (): SecurityKeyWarningModalReturn => {
  const { state, dispatch } = useSecurityTabContext();
  const { resources } = state;
  const { deleteAllSecurityKeys } = useDeleteAllSecurityKeys();
  const [currentPendingActionFunction, setCurrentPendingActionFunction] = useState<
    ((closeModal?: () => void) => Promise<void>) | null
  >(null);

  const showWarningModal = useCallback(
    (
      customMessage: string,
      options?: { skipDeletion?: boolean; onConfirm?: () => Promise<void> },
    ) => {
      const { skipDeletion = false, onConfirm } = options || {};

      const pendingActionFunction = async (closeModal?: () => void) => {
        if (skipDeletion) {
          if (onConfirm) {
            await onConfirm();
          }
        } else {
          // Default behavior: delete all security keys, then call custom onConfirm
          await deleteAllSecurityKeys();
          if (onConfirm) {
            await onConfirm();
          }
        }
        closeModal?.();
      };

      // Store the current pending action function for testing
      setCurrentPendingActionFunction(() => pendingActionFunction);

      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.SECURITY_KEY_DELETED_WARNING,
        additionalModalProps: {
          title: resources.Response.Dialog.Warning,
          pendingActionFunction,
          customMessage,
        },
      });
    },
    [dispatch, resources, deleteAllSecurityKeys],
  );

  return {
    showWarningModal,
    pendingActionFunction: currentPendingActionFunction,
  };
};

export default useSecurityKeyWarningModal;
