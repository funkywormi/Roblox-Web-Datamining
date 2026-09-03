import type { ReactNode } from "react";

/**
 * Stops click events from escaping to the legacy page shell.
 *
 * @rbx/foundation-ui's Checkbox (Radix) renders a hidden form input that dispatches a bubbling
 * native click on every toggle. Because this app mounts inside the legacy page's global
 * <form>, that click otherwise reaches the host page, which resets scroll to the top. Wrapping
 * a checkbox in this boundary contains the click while leaving the control itself untouched.
 *
 * This is an event boundary, not an interactive element — the wrapped control keeps its own
 * keyboard/mouse accessibility — so the jsx-a11y interaction rules do not apply here.
 */
const ClickBoundary = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): React.ReactElement => (
  // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
  <div
    className={className}
    onClick={event => {
      event.stopPropagation();
    }}
  >
    {children}
  </div>
);

export default ClickBoundary;
