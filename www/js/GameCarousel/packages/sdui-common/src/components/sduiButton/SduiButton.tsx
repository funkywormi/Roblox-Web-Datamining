"use client";
import { Button, type TButtonSize, type TButtonVariant } from "@rbx/foundation-ui";
import {
  buildDimCss,
  type SduiDim,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";

export interface SduiButtonProps extends SduiRendererInjectedProps {
  text?: string;
  size?: TButtonSize;
  variant?: TButtonVariant;
  width?: SduiDim;
  isDisabled?: boolean;
  // TODO: bind `isLoading` to fetch/mutation status (e.g. DataStatus.NotReady
  // or a future mutation-in-flight signal) so templates can drive loading
  // from hydration without hardcoding it.
  isLoading?: boolean;
  onActivated?: SduiResolvedAction;
}

/**
 * Web SDUI wrapper around Foundation Button with SDUI action resolution.
 */
export function SduiButton({
  text = "",
  size,
  variant,
  width,
  isDisabled,
  isLoading,
  onActivated,
}: SduiButtonProps) {
  const href = onActivated?.href;
  const widthCss = buildDimCss(width);

  const handleClick = () => {
    onActivated?.onActivated();
  };

  return (
    <Button
      {...(href ? { as: "a" as const, href } : { as: "button" as const })}
      size={size}
      variant={variant}
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleClick}
      {...(widthCss ? { style: { width: widthCss } } : {})}
    >
      {text}
    </Button>
  );
}
