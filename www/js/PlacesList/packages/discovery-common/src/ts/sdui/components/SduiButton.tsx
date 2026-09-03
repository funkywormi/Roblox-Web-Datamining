import React from "react";
import { Button, TButtonSize, TButtonVariant } from "@rbx/foundation-ui";
import { TSduiCommonProps } from "../system/SduiTypes";
import { TSduiParsedAction } from "../system/SduiActionParserRegistry";

type TSduiButtonProps = TSduiCommonProps & {
  text: string;
  size?: TButtonSize;
  variant?: TButtonVariant;
  onActivated?: TSduiParsedAction;
};

const SduiButton = ({ size, variant, text, onActivated }: TSduiButtonProps): JSX.Element => {
  const buttonSize = size ?? "Medium";
  const buttonVariant = variant ?? "Emphasis";

  const handleClick = () => {
    if (onActivated?.onActivated) {
      onActivated.onActivated();
    }
  };

  // If we have a linkPath, render as an anchor tag
  if (onActivated?.linkPath) {
    return (
      <Button
        as="a"
        size={buttonSize}
        variant={buttonVariant}
        href={onActivated.linkPath}
        onClick={handleClick}
      >
        {text}
      </Button>
    );
  }

  return (
    <Button as="button" size={buttonSize} variant={buttonVariant} onClick={handleClick}>
      {text}
    </Button>
  );
};

export default SduiButton;
