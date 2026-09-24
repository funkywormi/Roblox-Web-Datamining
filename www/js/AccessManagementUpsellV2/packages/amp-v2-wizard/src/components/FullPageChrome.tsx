/**
 * Full-page frame using the same portal and focus stack as the prologue and entrypoint dialogs,
 * with viewport-sized content instead of a centered card. Nodes using this still set ownsOverlay
 * so the host does not add a second dialog.
 */

import { useContext, type JSX, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@rbx/foundation-ui";

import { WizardLoadingContext } from "./WizardLoadingContext";

// 20px inset from `medium` (min-width 601px) up; full-width on phones. Arbitrary: margin scale stops at 16px.
export const FULL_PAGE_CTA_INSET_CLASS = "medium:[margin-inline:20px]";

const FULL_PAGE_BACK_OPTICAL_OFFSET_CLASS = "[margin-inline-start:-15px]";

export type FullPageChromeProps = {
  /** Optional header title. */
  title?: string;
  /** When set, a back chevron is shown in the header that invokes this. */
  onBack?: () => void;
  /** When set, a close affordance is shown in the header that invokes this. */
  onClose?: () => void;
  children: ReactNode;
};

export function FullPageChrome({
  title,
  onBack,
  onClose,
  children,
}: FullPageChromeProps): JSX.Element {
  const isLoading = useContext(WizardLoadingContext);

  return (
    <Dialog open isModal size="Medium" hasCloseAffordance={false}>
      <DialogContent
        overlayClassName="!padding-none ![overflow:hidden] ![animation:none]"
        className="!bg-surface-0 !radius-none ![border:0] ![box-shadow:none] ![animation:none] ![min-width:0] ![max-width:none] width-full [height:100dvh] flex flex-col"
      >
        {/* The host's DOM loading lock cannot cross a portal. Disable controls here as well. */}
        <fieldset
          disabled={isLoading}
          aria-busy={isLoading}
          data-testid="amp-v2-wizard-full-page-chrome"
          className={`margin-none padding-none [border:0] [min-width:0] [min-height:0] flex grow-1 flex-col${isLoading ? " pointer-events-none [opacity:0.5]" : ""}`}
        >
          {/* Header and body are centered independently so the scroller below can stay full-width
          and keep the side gutters scrollable. `scrollbar-gutter: stable both-edges` reserves
          classic-scrollbar space on both sides, so both columns stay centered on the same axis. */}
          <div
            className="margin-x-auto gap-small width-full max-width-[730px] padding-x-xlarge padding-y-medium flex shrink-0 items-center [min-height:64px] [box-sizing:border-box]"
            data-testid="amp-v2-wizard-full-page-header"
          >
            {onBack ? (
              <IconButton
                icon="icon-regular-chevron-large-left"
                ariaLabel="Back"
                variant="Utility"
                size="Medium"
                // The chevron sits 15px inside the button's 40px hit target, which would leave it
                // hanging right of the body text. Pull the button out so the glyph lands on the rail.
                className={FULL_PAGE_BACK_OPTICAL_OFFSET_CLASS}
                onClick={onBack}
              />
            ) : null}
            <DialogTitle
              hidden={!title}
              className="text-heading-small content-emphasis margin-none"
            >
              {title}
            </DialogTitle>
            {onClose ? (
              <IconButton
                icon="icon-regular-x"
                ariaLabel="Close"
                variant="Utility"
                size="Medium"
                className="margin-left-auto"
                onClick={onClose}
              />
            ) : null}
          </div>
          {/* grow-1 (`flex: 1 1 0`) so this scrolls; Foundation `grow` is `1 0 auto` and overflows. */}
          <div
            className="scroll-y [scrollbar-gutter:stable_both-edges] [min-height:0] flex grow-1 flex-col"
            data-testid="amp-v2-wizard-full-page-scroller"
          >
            <div
              className="margin-x-auto width-full max-width-[730px] padding-x-xlarge padding-top-large [padding-bottom:64px] [box-sizing:border-box] flex grow flex-col"
              data-testid="amp-v2-wizard-full-page-content"
            >
              {children}
            </div>
          </div>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
