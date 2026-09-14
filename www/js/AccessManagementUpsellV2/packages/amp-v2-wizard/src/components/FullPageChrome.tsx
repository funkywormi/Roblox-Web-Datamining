/**
 * Full-page frame for a wizard node: header (optional back + title) over an opaque `fixed` surface,
 * content in a ~480px column. A node opts in by rendering this and setting `ownsOverlay` (the host
 * then skips its own modal Overlay). Recreates the Dialog's modal semantics — role="dialog"/
 * aria-modal, focus trap, body scroll lock — so keyboard/AT users can't reach the page behind it.
 */

import { useEffect, useRef, type JSX, type ReactNode } from "react";
import { Divider, IconButton } from "@rbx/foundation-ui";

export type FullPageChromeProps = {
  /** Optional header title. */
  title?: string;
  /** When set, a back chevron is shown in the header that invokes this. */
  onBack?: () => void;
  children: ReactNode;
};

// One FullPageChrome mounts at a time, so a stable id wires the dialog to its title.
const TITLE_ID = "amp-v2-wizard-full-page-title";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function FullPageChrome({ title, onBack, children }: FullPageChromeProps): JSX.Element {
  const surfaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (surface == null) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;
    // Start focus inside the surface, not on the page behind it.
    surface.focus();

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    // Trap Tab focus so it can't wrap out to the page behind the opaque cover.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") {
        return;
      }
      const focusable = [...surface.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (first == null || last == null) {
        // Nothing focusable: keep focus on the surface.
        event.preventDefault();
        surface.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === surface)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    surface.addEventListener("keydown", onKeyDown);

    return () => {
      surface.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  return (
    <div
      ref={surfaceRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? TITLE_ID : undefined}
      tabIndex={-1}
      data-testid="amp-v2-wizard-full-page-chrome"
      className="bg-surface-0 fixed inset-[0px] flex flex-col [z-index:1050]"
    >
      {/* Reserve the with-chevron header height so it doesn't collapse when there is no back chevron.
          Set to the full row height (not the icon-button height) so it holds under border-box sizing. */}
      <div className="gap-small padding-x-large padding-y-medium flex items-center [min-height:64px] [box-sizing:border-box]">
        {onBack ? (
          <IconButton
            icon="icon-regular-chevron-large-left"
            ariaLabel="Back"
            variant="Utility"
            size="Medium"
            onClick={onBack}
          />
        ) : null}
        {title ? (
          <h1 id={TITLE_ID} className="text-heading-small content-emphasis margin-none">
            {title}
          </h1>
        ) : null}
      </div>
      <Divider />
      <div className="scroll-y flex grow flex-col">
        <div className="margin-x-auto width-full padding-large max-width-[480px] [box-sizing:border-box] flex grow flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
