import React from "react";
import classNames from "classnames";
import { Button } from "@rbx/foundation-ui";
import {
  buttonWidths,
  fuiButtonStyle,
  fullWidthClassName,
  TButtonWidth,
} from "../constants/buttonWidths";

type TPurchaseButtonUI = {
  buttonContent: number | string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  redirectUrl?: string;
  buttonWidth?: TButtonWidth;
  buttonClassName?: string;
  iconClassName?: string;
  hideButtonText?: boolean;
  hideButtonIcon?: boolean;
  isPurchasing?: boolean;
};

const PurchaseButtonUI = ({
  buttonWidth,
  buttonClassName,
  iconClassName,
  hideButtonText,
  hideButtonIcon,
  buttonContent,
  onClick,
  isPurchasing,
  redirectUrl,
}: TPurchaseButtonUI): React.JSX.Element => {
  if (redirectUrl) {
    return (
      <a href={redirectUrl} className="purchase-button-link">
        <Button
          data-testid="play-purchase-button"
          variant="Emphasis"
          style={fuiButtonStyle}
          className={classNames(fullWidthClassName(buttonWidth), buttonClassName)}
          onClick={() => null}
          isDisabled={isPurchasing}
        >
          {!hideButtonIcon && <span className={iconClassName} />}
          {!hideButtonText && <span className="btn-text">{buttonContent}</span>}
        </Button>
      </a>
    );
  }
  return (
    <Button
      data-testid="play-purchase-button"
      variant="Emphasis"
      style={fuiButtonStyle}
      className={classNames(fullWidthClassName(buttonWidth), buttonClassName)}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick && !isPurchasing) {
          onClick(e);
        }
      }}
      isDisabled={isPurchasing}
    >
      {!hideButtonIcon && <span className={iconClassName} />}
      {!hideButtonText && <span className="btn-text">{buttonContent}</span>}
    </Button>
  );
};

PurchaseButtonUI.defaultProps = {
  hideButtonText: false,
  buttonWidth: buttonWidths.full,
  buttonClassName: "btn-economy-robux-white-lg",
  iconClassName: "icon-robux-white",
  hideButtonIcon: false,
  isPurchasing: false,
  onClick: undefined,
  redirectUrl: undefined,
};

export default PurchaseButtonUI;
