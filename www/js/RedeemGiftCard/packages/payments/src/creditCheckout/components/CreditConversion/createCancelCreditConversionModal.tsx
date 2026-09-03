import { createModal, IModalService } from "react-style-guide";
import React from "react";
import { TranslateFunction } from "react-utilities";
import { TRANSLATION_KEYS } from "../../constants/redeemConstants";

type TCancelCreditConversionModalProps = {
  loading: boolean;
  onNeutral: () => void;
  translate: TranslateFunction;
};
export default function createCancelCreditConversionModal(): [
  ({ loading, onNeutral, translate }: TCancelCreditConversionModalProps) => JSX.Element,
  IModalService,
] {
  const [Modal, modalService] = createModal();

  function CancelCreditConversionModal({
    loading,
    onNeutral,
    translate,
  }: TCancelCreditConversionModalProps): JSX.Element {
    const body = (
      <div className="d-flex text-center text-description">
        {translate(TRANSLATION_KEYS.CodeNotYetRedeemedMessage)}
      </div>
    );

    return (
      <Modal
        id="cancel-credit-conversion-modal"
        title={translate(TRANSLATION_KEYS.CodeNotYetRedeemedHeading)}
        body={body}
        neutralButtonText={translate(TRANSLATION_KEYS.OkAction)}
        onNeutral={onNeutral}
        loading={loading}
        size="md"
      />
    );
  }

  return [CancelCreditConversionModal, modalService];
}
