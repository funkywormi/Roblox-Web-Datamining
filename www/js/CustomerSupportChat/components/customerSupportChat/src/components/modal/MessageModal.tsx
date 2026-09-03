import React, { useCallback, useMemo, useState } from "react";
import { FaceFrownIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { FragmentModalHeader, HeaderButtonType } from "./ModalFragmentHeader";
import { FooterButtonConfig, FragmentModalFooter } from "./ModalFragmentFooter";

export type MessageModalConfig = {
  headerText: string;
  bodyText: string;
  cancelText?: string;
  okText?: string;
  topIcon?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  dataTestId?: string;
};

type MessageModalProps = {
  config: MessageModalConfig;
  onClose: (confirmed: boolean) => void;
  t: TranslateFunction;
  isOpen: boolean;
};

/**
 * MessageModal is a modal that can display either a confirmation dialog with positive and negative buttons,
 * or a simple alert message with just a primary button.
 */
const MessageModal: React.FC<MessageModalProps> = ({ config, onClose, t, isOpen }) => {
  const {
    headerText,
    bodyText,
    cancelText,
    okText = t("Action.Dialog.OK"),
    topIcon,
    onOk,
    onCancel,
    dataTestId,
  } = config;

  const okButton: FooterButtonConfig | undefined = !okText
    ? undefined
    : {
        content: okText,
        label: okText,
        enabled: !!okText,
        action: () => {
          onOk?.();
          onClose(true);
        },
      };

  const cancelButton: FooterButtonConfig | undefined = !cancelText
    ? undefined
    : {
        content: cancelText || t("Action.Dialog.Cancel"),
        label: cancelText || t("Action.Dialog.Cancel"),
        enabled: !!cancelText,
        action: () => {
          onCancel?.();
          onClose(false);
        },
      };

  return (
    <Modal
      className="modal-modern px-12 md:px-16 lg:px-96"
      show={isOpen}
      onHide={onClose}
      onExited={onClose}
      data-testid={dataTestId}
    >
      <React.Fragment>
        <FragmentModalHeader
          headerText={headerText}
          buttonType={HeaderButtonType.CLOSE}
          buttonAction={() => {
            onClose(false);
          }}
          buttonEnabled
          headerInfo={null}
        />
        <Modal.Body>
          <div className="flex justify-center gray-300 my-2">{topIcon}</div>
          <div className="text-center">
            <span className="inline-block">{bodyText}</span>
          </div>
        </Modal.Body>
        <FragmentModalFooter positiveButton={okButton} negativeButton={cancelButton} />
      </React.Fragment>
    </Modal>
  );
};

type UseConfirmDialogResult = {
  confirm: (modalConfig: MessageModalConfig) => Promise<boolean>;
  modal: React.ReactNode;
};

export const useConfirmDialog = (t: TranslateFunction): UseConfirmDialogResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<MessageModalConfig | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((modalConfig: MessageModalConfig): Promise<boolean> => {
    return new Promise(resolve => {
      setConfig(modalConfig);
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const modal = useMemo(() => {
    if (!config) return null;

    const handleClose = (confirmed: boolean) => {
      setIsOpen(false);
      resolvePromise?.(confirmed);
      setResolvePromise(null);
    };

    return isOpen && <MessageModal config={config} onClose={handleClose} t={t} isOpen={isOpen} />;
  }, [config, resolvePromise, t, isOpen]);

  return {
    confirm,
    modal,
  };
};
