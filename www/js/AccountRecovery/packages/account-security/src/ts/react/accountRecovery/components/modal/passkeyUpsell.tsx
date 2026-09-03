/* eslint-disable react/jsx-no-literals */
import React from "react";
import { Modal } from "react-style-guide";
import "../../../../../css/accountRecovery/passkeyUpsellModal.scss";
import { useTokens } from "react-utilities";
import { AccountRecoveryResources } from "../../constants/resources";

interface PasskeyUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPasskey: () => void;
  resources: AccountRecoveryResources;
}

const PasskeyUpsellModal: React.FC<PasskeyUpsellModalProps> = ({
  isOpen,
  onClose,
  onAddPasskey,
  resources,
}) => {
  const tokens = useTokens();

  return (
    <Modal show={isOpen} onHide={onClose} size="sm" centered className="passkey-upsell-modal">
      <Modal.Body>
        <div className="passkey-upsell-image" aria-label="Passkey illustration" />
        <h3
          className="passkey-upsell-title"
          style={{
            fontSize: tokens.Typography.HeadingMedium.FontSize,
            fontWeight: tokens.Typography.HeadingMedium
              .FontWeight as React.CSSProperties["fontWeight"],
            lineHeight: tokens.Typography.HeadingMedium.LineHeight,
            fontFamily: tokens.Typography.HeadingMedium.FontFamily,
            letterSpacing: tokens.Typography.HeadingMedium.LetterSpacing,
          }}
        >
          {resources.Heading.PasskeyUpsellModalTitle}
        </h3>
        <p
          className="passkey-upsell-description"
          style={{
            fontSize: tokens.Typography.BodyLarge.FontSize,
            fontWeight: tokens.Typography.BodyLarge.FontWeight as React.CSSProperties["fontWeight"],
            lineHeight: tokens.Typography.BodyLarge.LineHeight,
            fontFamily: tokens.Typography.BodyLarge.FontFamily,
            letterSpacing: tokens.Typography.BodyLarge.LetterSpacing,
          }}
        >
          {resources.Heading.PasskeyUpsellModalSubtitle}
        </p>
        <div className="passkey-upsell-buttons">
          <button
            type="button"
            className="btn-growth-md"
            style={{
              fontSize: tokens.Typography.LabelMedium.FontSize,
              fontWeight: tokens.Typography.LabelMedium
                .FontWeight as React.CSSProperties["fontWeight"],
              lineHeight: tokens.Typography.LabelMedium.LineHeight,
              fontFamily: tokens.Typography.LabelMedium.FontFamily,
              letterSpacing: tokens.Typography.LabelMedium.LetterSpacing,
              height: tokens.Size.Size_1000,
            }}
            onClick={() => onAddPasskey()}
          >
            {resources.Label.AddPasskey}
          </button>
          <button
            type="button"
            className="btn-control-md"
            style={{
              fontSize: tokens.Typography.LabelMedium.FontSize,
              fontWeight: tokens.Typography.LabelMedium
                .FontWeight as React.CSSProperties["fontWeight"],
              lineHeight: tokens.Typography.LabelMedium.LineHeight,
              fontFamily: tokens.Typography.LabelMedium.FontFamily,
              letterSpacing: tokens.Typography.LabelMedium.LetterSpacing,
              height: tokens.Size.Size_1000,
            }}
            onClick={onClose}
          >
            {resources.Label.SkipPasskey}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default PasskeyUpsellModal;
