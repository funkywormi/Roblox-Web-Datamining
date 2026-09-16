/**
 * Full-page frame using the same portal and focus stack as the prologue and entrypoint dialogs,
 * with viewport-sized content instead of a centered card. Nodes using this still set ownsOverlay
 * so the host does not add a second dialog.
 */

import { useContext, type JSX, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle, Divider, IconButton } from "@rbx/foundation-ui";

import { WizardLoadingContext } from "./WizardLoadingContext";

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
          {/* Reserve the with-chevron header height so it doesn't collapse when there is no back chevron.
          Set to the full row height (not the icon-button height) so it holds under border-box sizing. */}
          <div className="gap-small padding-x-large padding-y-medium flex shrink-0 items-center [min-height:64px] [box-sizing:border-box]">
            {onBack ? (
              <IconButton
                icon="icon-regular-chevron-large-left"
                ariaLabel="Back"
                variant="Utility"
                size="Medium"
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
          <Divider />
          {/* grow-1 rather than grow on this and the fieldset above: Foundation's `grow` is
          `flex: 1 0 auto`, and that flex-shrink: 0 keeps both at content height on a short viewport,
          so the content overflows the dialog instead of scrolling here. The inner column keeps
          `grow` so it stays at content height and is what scrolls. */}
          <div className="scroll-y [min-height:0] flex grow-1 flex-col">
            <div className="margin-x-auto width-full padding-large max-width-[480px] [box-sizing:border-box] flex grow flex-col">
              {children}
            </div>
          </div>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
