import React, { memo } from "react";

import type { SduiRendererInjectedProps } from "../../types";
import { isPlainLeftClick } from "../../utils/navigation";

export interface ActionWrapperProps extends SduiRendererInjectedProps {
  href?: string;
  clientNavigation?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  "aria-pressed"?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseOver?: () => void;
  onMouseLeave?: () => void;
  children: React.ReactNode;
}

const linkStyleReset: React.CSSProperties = {
  textDecoration: "none",
  color: "inherit",
};

const buttonStyleReset: React.CSSProperties = {
  appearance: "none",
  WebkitAppearance: "none",
  border: "none",
  background: "transparent",
  backgroundColor: "transparent",
  padding: 0,
  margin: 0,
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
};

/**
 * Renders children inside the semantically correct element based on
 * the presence of `href` and/or `onClick`:
 *
 * - `href` present  -->  `<a>`
 * - `onClick` only  -->  `<button>`
 * - neither         -->  `<div>`
 *
 * If both `href` and `onClick` are provided, `onClick` fires on the `<a>` click.
 *
 * When `clientNavigation` is set, the `<a>` keeps its `href` but suppresses the
 * browser's default navigation on unmodified left clicks, letting `onClick`
 * perform an in-app route transition instead. Modified clicks (cmd/ctrl/shift/alt)
 * follow the browser default and do not invoke `onClick`.
 */
function ActionWrapperInner(props: ActionWrapperProps) {
  const {
    href,
    clientNavigation,
    onClick,
    className,
    style,
    ariaLabel,
    "aria-pressed": ariaPressed,
    onFocus,
    onBlur,
    onMouseOver,
    onMouseLeave,
    children,
  } = props;

  const sharedProps = {
    className,
    "aria-label": ariaLabel,
    "aria-pressed": ariaPressed,
    onFocus,
    onBlur,
    onMouseOver,
    onMouseLeave,
  };

  if (href) {
    return (
      <a
        href={href}
        style={{ ...linkStyleReset, ...style }}
        rel="noreferrer"
        onClick={e => {
          e.stopPropagation();
          if (clientNavigation) {
            if (isPlainLeftClick(e)) {
              e.preventDefault();
              onClick?.();
            }
          } else {
            onClick?.();
          }
        }}
        {...sharedProps}
      >
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        style={{ ...buttonStyleReset, ...style }}
        onClick={e => {
          e.stopPropagation();
          onClick();
        }}
        {...sharedProps}
      >
        {children}
      </button>
    );
  }

  return (
    <div style={style} {...sharedProps}>
      {children}
    </div>
  );
}

export const ActionWrapper = memo(ActionWrapperInner);
