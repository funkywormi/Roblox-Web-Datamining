import React from "react";
import { useTokens } from "react-utilities";

type Props = {
  /** The main, bolded text on the left. */
  title: string;
  /** The secondary, smaller text below the title. */
  subtitle: string;
  /** The text displayed on the button. */
  buttonText: string;
  /** An accessible label for the button, defaults to buttonText if not provided. */
  "aria-label"?: string;
  /** A boolean to control if the button is interactive. */
  isButtonEnabled?: boolean;
  /** The function to execute when the button is clicked. */
  onButtonClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

/**
 * A reusable row component with descriptive text on the left and a
 * call-to-action button on the right, always laid out horizontally.
 */
const ModernCardCTARow: React.FC<Props> = ({
  title,
  subtitle,
  buttonText,
  "aria-label": ariaLabel,
  isButtonEnabled = true,
  onButtonClick,
}) => {
  const tokens = useTokens();

  return (
    <div className="modern-card-cta-row">
      <div className="modern-card-cta-row-text-content">
        <p
          className="modern-card-cta-row-title"
          style={{
            fontSize: tokens.Typography.TitleMedium.FontSize,
            fontWeight: tokens.Typography.TitleMedium
              .FontWeight as React.CSSProperties["fontWeight"],
            lineHeight: tokens.Typography.TitleMedium.LineHeight,
            fontFamily: tokens.Typography.TitleMedium.FontFamily,
            letterSpacing: tokens.Typography.TitleMedium.LetterSpacing,
          }}
        >
          {title}
        </p>
        <p
          className="modern-card-cta-row-subtitle"
          style={{
            fontSize: tokens.Typography.BodyMedium.FontSize,
            fontWeight: tokens.Typography.BodyMedium
              .FontWeight as React.CSSProperties["fontWeight"],
            lineHeight: tokens.Typography.BodyMedium.LineHeight,
            fontFamily: tokens.Typography.BodyMedium.FontFamily,
            letterSpacing: tokens.Typography.BodyMedium.LetterSpacing,
          }}
        >
          {subtitle}
        </p>
      </div>
      <button
        type="button"
        className="btn-control-md"
        style={{
          fontSize: tokens.Typography.LabelMedium.FontSize,
          fontWeight: tokens.Typography.LabelMedium.FontWeight as React.CSSProperties["fontWeight"],
          lineHeight: tokens.Typography.LabelMedium.LineHeight,
          fontFamily: tokens.Typography.LabelMedium.FontFamily,
          letterSpacing: tokens.Typography.LabelMedium.LetterSpacing,
          height: tokens.Size.Size_1000,
        }}
        aria-label={ariaLabel ?? buttonText}
        disabled={!isButtonEnabled}
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default ModernCardCTARow;
