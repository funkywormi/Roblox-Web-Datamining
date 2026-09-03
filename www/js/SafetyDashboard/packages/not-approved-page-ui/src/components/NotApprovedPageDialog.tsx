import React, { Fragment, useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogBody } from "@rbx/foundation-ui";
import { EventTypes } from "../telemetry/analytics";
import { useNotApprovedUIConfig } from "../providers/NotApprovedUIProvider";
import useSendNotApprovedPageEvent from "../telemetry/useSendNotApprovedPageEvent";
import canReactivate from "../utils/canReactivate";
import NotApprovedPageContent from "./NotApprovedPageContent";
import GenericFallbackDialog from "./GenericFallbackDialog";
import { useNotApprovedPagePunishment } from "../context/NotApprovedPagePunishmentProvider";

interface NotApprovedPageDialogProps {
  /**
   * Optional controlled open state. When provided, the host owns whether the dialog is open and
   * the dialog calls {@link NotApprovedPageDialogProps.onClose} to request closing. When omitted,
   * the dialog manages its own open state and auto-opens on mount (the default moderation behavior).
   */
  open?: boolean;
  /**
   * Called when the dialog requests to close while controlled (i.e. `open` is provided). Hosts
   * should update their own state to close the dialog in response.
   */
  onClose?: () => void;
}

/**
 * The main component for determining what to render for the Not Approved Page. Based on the
 * punishmentContext, it decides whether to render the self-service reactivation flow, a generic
 * fallback, or the standard Not Approved Page dialog.
 *
 * The dialog itself uses the render-prop {@link NotApprovedPageContent} to get pre-built
 * header/body/ctas slots and arranges them in a flex-column layout inside DialogBody.
 */
const NotApprovedPageDialog = ({
  open,
  onClose,
}: NotApprovedPageDialogProps): React.JSX.Element | null => {
  const [internalOpen, setInternalOpen] = useState(true);
  const isControlled = open !== undefined;
  const isOpen = open ?? internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    // If the dialog is controlled, we only need to worry about the user closing the dialog as the consumer will be responsible for opening it again.
    if (isControlled && !nextOpen) {
      onClose?.();
    } else {
      setInternalOpen(nextOpen);
    }
  };

  const { translate, renderSelfServiceDeactivated, shouldShowGenericFallback, readOnly } =
    useNotApprovedUIConfig();
  const sendEvent = useSendNotApprovedPageEvent();
  const { punishmentData, isLoading, error } = useNotApprovedPagePunishment();

  const isReady = !isLoading && !error && punishmentData !== undefined;
  const hasNoPunishmentData = !isLoading && !error && !punishmentData;

  useEffect(() => {
    if (punishmentData) {
      const eventType = punishmentData.context?.SelfServiceDeactivated
        ? EventTypes.AccountReactivationPageRendered
        : EventTypes.PageRendered;

      sendEvent(eventType, {
        interventionId: punishmentData.interventionId,
        punishedUserId: punishmentData.punishedUserId,
        isReactivationEligible: canReactivate(
          punishmentData.punishmentTypeDescription,
          punishmentData.endDate,
          punishmentData.verificationCategory,
        ),
        verificationCategory: punishmentData.verificationCategory,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sendEvent identity should not re-trigger page render analytics
  }, [punishmentData]);

  /**
   * If there is no punishment data, let the host decide what to do
   * (redirect, log, etc.) and render nothing.
   *
   * Exception: in read-only mode the dialog was opened deliberately by the host (e.g. a safety
   * dashboard row the user clicked), so silently rendering nothing looks broken. Fall through to
   * the error state below instead, which gives the user clear feedback and a way to dismiss.
   */
  if (hasNoPunishmentData && !readOnly) {
    return null;
  }

  /**
   * If the punishmentData determines that the account was deactivated by the user,
   * we can just redirect them to the account reactivation page since this is separate from the
   * moderation logic in the Not Approved Page.
   *
   * Hosts that provide their own `renderSelfServiceDeactivated` keep their custom UI.
   * Otherwise the package renders the built-in GenericFallbackDialog.
   */
  if (isReady && punishmentData.context?.SelfServiceDeactivated) {
    return renderSelfServiceDeactivated ? (
      <Fragment>{renderSelfServiceDeactivated()}</Fragment>
    ) : (
      <GenericFallbackDialog impressionEvent={EventTypes.AccountReactivationRedirectRendered} />
    );
  }

  /**
   * Built-in generic fallback. The host opts in by providing `shouldShowGenericFallback`. The
   * package renders its own self-contained dialog (logout + "Go to Roblox") when the predicate
   * returns true for the current punishmentData.
   */
  const fallbackImpressionEvent = isReady && shouldShowGenericFallback?.(punishmentData);
  if (fallbackImpressionEvent) {
    return <GenericFallbackDialog impressionEvent={fallbackImpressionEvent} />;
  }

  return (
    <Dialog
      open={isOpen}
      size="Large"
      hasCloseAffordance={Boolean(readOnly)}
      closeLabel={translate("Action.Close")}
      isModal
      onOpenChange={
        readOnly
          ? nextOpen => {
              if (!nextOpen) handleOpenChange(false);
            }
          : undefined
      }
    >
      <DialogContent
        /**
         * Hosts that disable Tailwind Preflight globally (e.g. Creator Hub) leave default
         * user-agent margins on <p> and the <h2> that `DialogTitle` renders, which introduces
         * unwanted gaps inside the dialog. The descendant-variant resets below normalize both
         * tags locally. Safe to remove once every host ships a matching Preflight (or equivalent).
         */
        className="width-full [&_p]:margin-none [&_h2]:margin-none"
        onOpenAutoFocus={event => {
          event.preventDefault();
        }}
      >
        <DialogBody className="flex flex-col height-[85vh] max-height-[800px]">
          <NotApprovedPageContent onOpenChange={handleOpenChange}>
            {({ header, body, ctas }) => (
              <div className="flex flex-col gap-large height-full min-height-0">
                <DialogTitle className="padding-none">{header}</DialogTitle>
                <div className="grow-1 scroll-y min-height-0">
                  {body}
                  <div
                    className="bg-surface-100"
                    /**
                     * Fixed fade block that sticks to the bottom, "over" the scrollable content. It is
                     * used to make it more obvious to the user that there is more content behind the CTA
                     * buttons instead of the content abruptly getting cut off by the CTA buttons.
                     */
                    style={{
                      position: "sticky",
                      bottom: -1,
                      left: 0,
                      height: "40px",
                      maskImage:
                        "linear-gradient(to bottom, transparent 0%, var(--color-surface-100) 100%)",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0%, var(--color-surface-100) 100%)",
                    }}
                  />
                </div>
                <div className="shrink-0">{ctas}</div>
              </div>
            )}
          </NotApprovedPageContent>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default NotApprovedPageDialog;
