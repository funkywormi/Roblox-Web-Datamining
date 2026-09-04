"use client";
import { IconButton, type TIconButtonSize, type TIconButtonVariant } from "@rbx/foundation-ui";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

import type { SduiRendererInjectedProps, SduiResolvedAction } from "../types";

export interface SduiIconButtonProps extends SduiRendererInjectedProps {
  /** Allowlisted Tailwind icon class, already resolved by the `FoundationIconConfigProp` builder. */
  icon?: TTailwindIconClass;
  /**
   * Accessible label, supplied by the server as a localized string via
   * `IconButtonSchema.WebProps.aria_label`. Icon-only buttons carry no visible
   * text, so the label must come from the template, not be derived client-side.
   * Required for accessibility; the registry widens props to
   * `Record<string, unknown>`, so this contract is enforced at the type level here.
   */
  ariaLabel: string;
  /** Foundation IconButton visual variant, passed through from the server `variant` StringProp. */
  variant?: TIconButtonVariant;
  /** Foundation IconButton size, passed through from the server `size` InputSizeProp. */
  size?: TIconButtonSize;
  isCircular?: boolean;
  isDisabled?: boolean;
  onActivated?: SduiResolvedAction;
}

/**
 * SDUI wrapper for the Foundation `IconButton` (`UiComponentType.ICON_BUTTON`).
 *
 * `icon` arrives pre-resolved to an allowlisted Tailwind class from the
 * `FoundationIconConfigProp` builder, and `ariaLabel` is the server-provided
 * localized label (`IconButtonSchema.WebProps.aria_label`). A link action
 * renders as `<a>`, otherwise a `<button>`. An unresolved icon renders nothing
 * (IconButton requires one).
 */
export function SduiIconButton({
  icon,
  ariaLabel,
  variant,
  size,
  isCircular,
  isDisabled,
  onActivated,
}: SduiIconButtonProps) {
  if (!icon) return null;

  const href = onActivated?.href;
  const handleClick = () => {
    onActivated?.onActivated();
  };

  if (href) {
    return (
      <IconButton
        as="a"
        href={href}
        icon={icon}
        ariaLabel={ariaLabel}
        variant={variant}
        size={size}
        isCircular={isCircular}
        isDisabled={isDisabled}
        onClick={handleClick}
      />
    );
  }

  return (
    <IconButton
      as="button"
      icon={icon}
      ariaLabel={ariaLabel}
      variant={variant}
      size={size}
      isCircular={isCircular}
      isDisabled={isDisabled}
      onClick={handleClick}
    />
  );
}
