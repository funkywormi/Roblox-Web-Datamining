/**
 * TODO: move to a component library.
 *
 * Another rendition of an update email modal. This should probably be pulled out into our own
 * component library so we can stop copy-pasting roughly similar implementations across webapps...
 */

import { Button, TextInput } from "@rbx/foundation-ui";
import React, { useState } from "react";
import "../../../../../css/tailwind.css";
import { Modal } from "react-style-guide";
import { FragmentModalHeader, HeaderButtonType } from "../../../common/modalHeader";

export type EmailSubmitPayload = {
  value: string;
  /**
   * We expose the inner state handler to avoid specific email update details from leaking
   * into this component. Callers can set the error text by modelled error if they'd like.
   *
   * Don't use the same resource string for this error as the prop `errorText`, or the button
   * will remain disabled even on network errors.
   */
  innerErrorTextSetter: React.Dispatch<React.SetStateAction<string | null>>;
  closeModal: () => void;
};

export type EmailUpdateModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Parametrizing web-frontend-specific logic so we don't have to keep duplicating this.
   *
   * We pass state hooks as parameters to this callback so callers can decide how to configure
   * this component.
   */
  onEmailSubmit: (payload: EmailSubmitPayload) => void;

  /**
   * Localized title of the modal.
   */
  titleText: string;

  /**
   * Localized body text of the modal.
   */
  bodyText: string;

  /**
   * Localized button text of the modal.
   */
  buttonText: string;

  /**
   * Localized placeholder text of the modal.
   */
  placeholderText: string;

  /**
   * Localized error text of the modal.
   */
  errorText: string;
};

export const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({
  open,
  setOpen,
  onEmailSubmit,
  titleText,
  bodyText,
  buttonText,
  placeholderText,
  errorText,
}: EmailUpdateModalProps) => {
  const [inputErrorString, setInputErrorString] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [currentEmailValue, setCurrentEmailValue] = useState<string>("");

  const closeModal = () => {
    setOpen(false);
  };

  const wrappedOnEmailSubmit = (payload: EmailSubmitPayload) => {
    setRequestInFlight(true);
    onEmailSubmit(payload);
    setRequestInFlight(false);
  };

  const onSubmitHandler = () =>
    wrappedOnEmailSubmit({
      value: currentEmailValue,
      innerErrorTextSetter: setInputErrorString,
      closeModal,
    });

  const onKeydown = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") {
      return;
    }

    onSubmitHandler();
  };

  const onChangeHandler = (value: string) => {
    setCurrentEmailValue(value);

    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(value)) {
      setInputErrorString(null);
      return;
    }
    setInputErrorString(errorText);
  };

  // This component still uses the legacy `react-style-guide` Modal because the new Dialog foundation
  // component has a focus trap that's not configurable. When 2SV renders on top of this component,
  // it will attempt to grab the focus globally as well, resulting in a stack overflow.
  return (
    <Modal
      show={open}
      onHide={closeModal}
      backdrop="static"
      className="modal-modern margin-y-small"
    >
      <FragmentModalHeader
        headerText={titleText}
        buttonType={HeaderButtonType.CLOSE}
        buttonAction={closeModal}
        buttonEnabled={!requestInFlight}
        headerInfo={null}
      />
      <Modal.Body>
        <TextInput
          // There's a global style on the page targeting inputs making the inner element
          // different from the container, styled element... This overrides it via descendent
          // combinators.
          //
          // We need the specific selector to get more specificity than the existing global
          // style.
          className="[&_input]:bg-action-utility gap-y-medium"
          placeholder={placeholderText}
          error={inputErrorString ?? undefined}
          onChange={ev => onChangeHandler(ev.currentTarget.value)}
          isDisabled={requestInFlight}
          onKeyDown={onKeydown}
          data-testid="email-update-submit-implicit"
        />
        <div className="text-body-small text-align-x-left margin-top-small">{bodyText}</div>
      </Modal.Body>
      <Modal.Footer className="flex">
        <Button
          variant="Standard"
          className="flex flex-col fill"
          onClick={onSubmitHandler}
          // Don't disable the button if there's an error populated by the request to the underlying
          // email endpoint.
          isDisabled={inputErrorString === errorText}
          data-testid="email-update-submit"
        >
          {buttonText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
