import React, { useEffect, useMemo, useRef } from "react";
import { Tooltip, TooltipTrigger } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import tradesConstants from "../constants/tradesConstants";
import useTradeRequest from "../hooks/useTradeRequest";
import { sendAXEvent, tradeEvents } from "../services/tradeEvents";
import { redirectToSettings } from "../services/verification";
import { TradesRoute, useTradesRouter } from "../tradesRouter";
import getEntryContext from "../utils/tradeEntryContext";
import { isMobile as detectMobile } from "../utils/tradesUtils";
import { log } from "../utils/logger";
import ConfirmDialog from "./ConfirmDialog";
import InventoryPanel from "./InventoryPanel";
import OfferColumn from "./OfferColumn";

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

export type TradeRequestProps = {
  route: TradesRoute;
  systemFeedbackService: SystemFeedbackService;
};

/**
 * The trade-request builder page (port of tradeRequest.html + tradeRequestController).
 * Handles both creating a new trade (create view) and countering an existing one.
 */
export const TradeRequest = ({ route, systemFeedbackService }: TradeRequestProps): JSX.Element => {
  const { translate } = useTranslation();
  const { navigate } = useTradesRouter();
  const isMobile = useMemo(() => detectMobile(), []);

  const tr = useTradeRequest(systemFeedbackService);

  // Page-view analytics: createTrade / counterTrade (once per mount).
  const pageViewFiredRef = useRef(false);
  useEffect(() => {
    if (pageViewFiredRef.current) {
      return;
    }
    pageViewFiredRef.current = true;
    const isCounter = route.view === "counter";
    const entryContext = getEntryContext();
    sendAXEvent(tradeEvents.pageView, isCounter ? "counterTrade" : "createTrade", {
      state: isCounter ? tradesConstants.states.counterTrade : tradesConstants.states.tradeWithUser,
      referrer: entryContext.referrer,
      entrySource: entryContext.entrySource,
    });
  }, [route.view]);

  const displayOffers = useMemo(
    () => tr.offers.toSorted((a, b) => Number(b.isMyOffer) - Number(a.isMyOffer)),
    [tr.offers],
  );

  log(
    "TradeRequest render: view=",
    route.view,
    "loaded=",
    tr.loaded,
    "initError=",
    tr.initError,
    "offers=",
    tr.offers.length,
  );

  return (
    <div className={`trades-react trade-request-react${isMobile ? " is-mobile" : ""}`}>
      <div className="trade-request-window">
        <span
          className="text-link cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => {
            navigate({ view: "list" });
          }}
          onKeyDown={event => {
            if (event.key === "Enter" || event.key === " ") {
              navigate({ view: "list" });
            }
          }}
        >
          <span className="icon-back" />
          <span>{translate("Action.BackToTrades")}</span>
        </span>

        <h1 className="trades-header-nowrap">
          {tr.partner && (
            <span
              className="paired-name"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate("Label.TradeWithPartner", {
                  username: tr.partner.nameForDisplay,
                }),
              }}
            />
          )}
        </h1>

        <span className="trade-holding-container">
          <Tooltip
            position="bottom-end"
            title={translate("Label.HoldingPolicy")}
            description={translate("Message.HoldingPolicy")}
          >
            <TooltipTrigger asChild>
              {/* Focusable so keyboard users can open the holding-policy tooltip. */}
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
              <span className="tooltip-container" tabIndex={0}>
                <span className="font-caption-body text trade-holding-period-label">
                  {translate("Label.HoldingPeriod")}
                </span>
                <span className="icon-actions-info-sm" />
              </span>
            </TooltipTrigger>
          </Tooltip>
        </span>

        {!tr.loaded && !tr.initError && <span className="spinner spinner-default" />}

        {tr.initError && <div className="text-error section-content-off">{tr.initError}</div>}

        {tr.loaded && (
          <React.Fragment>
            <div className="inventory-panel-holder">
              {displayOffers.map(offer => (
                <InventoryPanel
                  key={offer.user.id}
                  user={offer.user}
                  onItemClick={tr.toggleItem}
                  isItemInOffers={tr.isItemInOffers}
                  isItemUnavailable={tr.isItemUnavailable}
                />
              ))}
            </div>

            <div className="trade-request-window-offers-parent">
              <div className="trade-request-window-offers">
                {displayOffers.map(offer => (
                  <OfferColumn
                    key={offer.user.id}
                    offer={offer}
                    onRemoveItem={tr.removeItem}
                    onRobuxChange={tr.setRobux}
                    onRobuxBlur={tr.onRobuxBlur}
                    isRobuxValid={tr.isRobuxAmountValid}
                    doesItemHaveError={tr.doesItemHaveError}
                    getItemErrorReason={tr.getItemErrorReason}
                  />
                ))}
                {tr.error && <div className="text-error">{tr.error}</div>}
                <button
                  type="button"
                  className="btn-cta-md btn-full-width"
                  disabled={tr.tradePending}
                  onClick={tr.requestSend}
                >
                  {translate("Label.RequestTrade")}
                </button>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <ConfirmDialog
        open={tr.confirmSendOpen}
        title={translate("Header.SendOffer")}
        body={translate("Label.TradesAreFinalOnceComplete")}
        actionText={translate("Action.SendTrade")}
        actionVariant="Emphasis"
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        footerNote={
          <div className="text-footer">
            {translate("Label.ItemsMayBeHeldUpToDaysAfterTrading", {
              days: tradesConstants.holdingPeriodDays,
            })}
          </div>
        }
        onAction={tr.confirmSend}
        onCancel={tr.cancelSend}
      />

      <ConfirmDialog
        open={tr.economicBody !== null}
        title={translate("Heading.EconomicRestrictionsError")}
        body={tr.economicBody ?? ""}
        showAction={false}
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        onCancel={tr.dismissEconomic}
      />

      <ConfirmDialog
        open={tr.verificationRedirectOpen}
        title={translate("Heading.TwoStepVerificationRequired")}
        body={translate("Message.TwoStepVerificationRequired")}
        actionText={translate("Action.GoToSecurity")}
        actionVariant="Emphasis"
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        onAction={() => {
          tr.dismissVerificationRedirect();
          redirectToSettings();
        }}
        onCancel={tr.dismissVerificationRedirect}
      />
    </div>
  );
};

export default TradeRequest;
