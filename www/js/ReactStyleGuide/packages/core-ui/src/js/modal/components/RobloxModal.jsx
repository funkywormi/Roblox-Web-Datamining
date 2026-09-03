import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/lib/Modal";
import ModalDialog from "react-bootstrap/lib/ModalDialog";
import ModalTitle from "react-bootstrap/lib/ModalTitle";
import { Dialog, DialogContent } from "@rbx/foundation-ui";
import ModalBody from "./RobloxModalBody";
import ModalFooter from "./RobloxModalFooter";
import ModalHeader from "./RobloxModalHeader";
import { useFoundationModalExperiment } from "../utils/useFoundationModalExperiment";

// Size mapping from Bootstrap sizes to Foundation sizes
const SIZE_MAP = {
  // Small Foundation dialogs have too small max width, breaking some modals.
  sm: "Medium",
  md: "Medium",
  lg: "Large",
};

function FoundationRobloxModal({
  show,
  size,
  onHide,
  children,
  backdrop,
  keyboard,
  dialogClassName,
  onExited,
  onEntered,
  onEntering,
  onExiting,
  "aria-labelledby": ariaLabelledBy,
  id,
  ...otherProps
}) {
  const wasOpenRef = useRef(show);
  const closeHandledRef = useRef(false);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    if (wasOpen !== show) {
      if (show) {
        if (onEntering) {
          onEntering();
        }
        if (onEntered) {
          setTimeout(() => {
            onEntered();
          }, 0);
        }
      } else {
        if (!closeHandledRef.current) {
          if (onExiting) {
            onExiting();
          }
          if (onExited) {
            setTimeout(() => {
              onExited();
            }, 0);
          }
        }
        closeHandledRef.current = false;
      }
    }

    wasOpenRef.current = show;
  }, [onEntered, onEntering, onExited, onExiting, show]);

  const foundationSize = SIZE_MAP[size] || "Medium";
  const isStaticBackdrop = backdrop === "static";
  const hasBackdrop = backdrop !== false;
  const allowKeyboardClose = keyboard !== false;

  return (
    <Dialog
      open={show}
      onOpenChange={open => {
        if (!open) {
          closeHandledRef.current = true;
          if (onExiting) {
            onExiting();
          }
          if (onHide) {
            onHide();
          }
          if (onExited) {
            setTimeout(() => {
              onExited();
            }, 0);
          }
        }
      }}
      size={foundationSize}
      isModal={hasBackdrop}
      hasCloseAffordance={false}
      closeLabel=""
      aria-labelledby={ariaLabelledBy}
      experimentalDisablePointerEventsStylingOnBody
    >
      <DialogContent
        overlayClassName={otherProps.className}
        style={{ background: "none", border: "none" }}
        className={`modal-dialog${dialogClassName ? ` ${dialogClassName}` : ""}`}
        onPointerDownOutside={isStaticBackdrop ? e => e.preventDefault() : undefined}
        onInteractOutside={isStaticBackdrop ? e => e.preventDefault() : undefined}
        onEscapeKeyDown={!allowKeyboardClose ? e => e.preventDefault() : undefined}
      >
        <div id={id} className="modal-content">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// There is a lot more props that we can utilize in the implementation
// I only list those common ones here so we can do type checking
// We can discuss to define the props we want to support as the API
function RobloxModal({
  show,
  size,
  onHide,
  children,
  backdrop,
  keyboard,
  dialogClassName,
  onExited,
  onEntered,
  onEntering,
  onExiting,
  "aria-labelledby": ariaLabelledBy,
  id,
  ...otherProps
}) {
  const { useFoundation } = useFoundationModalExperiment();

  if (useFoundation) {
    return (
      <FoundationRobloxModal
        {...otherProps}
        show={show}
        size={size}
        onHide={onHide}
        backdrop={backdrop}
        keyboard={keyboard}
        dialogClassName={dialogClassName}
        onExited={onExited}
        onEntered={onEntered}
        onEntering={onEntering}
        onExiting={onExiting}
        aria-labelledby={ariaLabelledBy}
        id={id}
      >
        {children}
      </FoundationRobloxModal>
    );
  }

  // Original Bootstrap implementation
  return (
    <Modal
      {...otherProps}
      show={show}
      bsSize={size}
      onHide={onHide}
      backdrop={backdrop}
      keyboard={keyboard}
      dialogClassName={dialogClassName}
      onExited={onExited}
      onEntered={onEntered}
      onEntering={onEntering}
      onExiting={onExiting}
      aria-labelledby={ariaLabelledBy}
      id={id}
    >
      {children}
    </Modal>
  );
}

RobloxModal.defaultProps = {
  show: false,
  size: null,
  onHide: null,
  children: null,
  backdrop: true,
  keyboard: true,
};

RobloxModal.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  onHide: PropTypes.func,
  children: PropTypes.node,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(["static"])]),
  keyboard: PropTypes.bool,
  dialogClassName: PropTypes.string,
  onExited: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExiting: PropTypes.func,
  "aria-labelledby": PropTypes.string,
  id: PropTypes.string,
};

FoundationRobloxModal.propTypes = {
  show: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  onHide: PropTypes.func,
  children: PropTypes.node,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(["static"])]),
  keyboard: PropTypes.bool,
  dialogClassName: PropTypes.string,
  onExited: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExiting: PropTypes.func,
  "aria-labelledby": PropTypes.string,
  id: PropTypes.string,
};

RobloxModal.Title = ModalTitle;
RobloxModal.Header = ModalHeader;
RobloxModal.Body = ModalBody;
RobloxModal.Footer = ModalFooter;
RobloxModal.Dialog = ModalDialog;

export default RobloxModal;
