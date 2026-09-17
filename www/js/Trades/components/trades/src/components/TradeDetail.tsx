import { useRef, useState } from "react";
import { isBlackbirdUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, IconButton, ProgressCircle } from "@rbx/foundation-ui";
import tradesConstants from "../constants/tradesConstants";
import {
  acceptTrade,
  declineTrade,
  getErrorCodes,
  refreshCanTrade,
  resolveCannotTradeAction,
} from "../services/tradesApi";
import {
  getTradeItemParameters,
  sendAXError,
  sendAXEvent,
  sendEvent,
  tradeEvents,
} from "../services/tradeEvents";
import {
  is2SVEnabled,
  redirectToSettings,
  startFacialAgeEstimation,
} from "../services/verification";
import { EconomicRestriction, TradeDetail as TradeDetailType } from "../types";
import { getOfferLabel, isMyOffer } from "../utils/tradeLabels";
import { getCommonErrorMessage } from "../utils/tradeErrors";
import { localizeDate } from "../utils/tradesUtils";
import { log, warn } from "../utils/logger";
import { useTradesRouter } from "../tradesRouter";
import useTradeQuota from "../hooks/useTradeQuota";
import useTwoStepVerification from "../hooks/useTwoStepVerification";
import ConfirmDialog from "./ConfirmDialog";
import TradeOffer from "./TradeOffer";
import TradePlusUpsellSheet from "./TradePlusUpsellSheet";
import TradeAgeCheckPrompt from "./TradeAgeCheckPrompt";

type SystemFeedbackService = {
  success: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
  warning: (message?: string, timeoutShow?: number, timeoutHide?: number) => void;
};

export type TradeDetailProps = {
  trade: TradeDetailType | null;
  detailLoading: boolean;
  isMobile: boolean;
  onBack: () => void;
  onProfileClick: (trade: TradeDetailType, source: string) => void;
  onTradeRemoved: (tradeId: number) => void;
  systemFeedbackService: SystemFeedbackService;
};

type DialogKind =
  | "accept"
  | "decline"
  | "economic"
  | "verificationRedirect"
  | "plusUpsell"
  | "ageCheck"
  | null;

export const TradeDetail = ({
  trade,
  detailLoading,
  isMobile,
  onBack,
  onProfileClick,
  onTradeRemoved,
  systemFeedbackService,
}: TradeDetailProps): JSX.Element | null => {
  const { translate } = useTranslation();
  const { navigate } = useTradesRouter();
  const twoStepVerification = useTwoStepVerification(systemFeedbackService);
  const tradeQuota = useTradeQuota();
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [economicBody, setEconomicBody] = useState("");
  const [processing, setProcessing] = useState(false);
  const faeRetryAttemptedRef = useRef(false);
  // The accept to replay once the age check clears, held across the prelude.
  const retryAcceptRef = useRef<(() => void) | null>(null);

  // Nothing selected yet. On mobile the panes swap rather than sit side by side,
  // so there is no empty pane to fill and the placeholder would be a dead screen.
  if (!trade) {
    return isMobile ? null : (
      <div className="trade-detail-placeholder">
        {translate("Label.TradeDetailsWillShowUpHere")}
      </div>
    );
  }

  const isOpen = trade.status === tradesConstants.tradeStatus.open;
  const isInbound = trade.tradeStatusType === tradesConstants.tradeStatusType.inbound;
  const isOutbound = trade.tradeStatusType === tradesConstants.tradeStatusType.outbound;

  const orderedOffers = trade.offers
    ? trade.offers.toSorted((a, b) => Number(isMyOffer(b)) - Number(isMyOffer(a)))
    : [];

  const showEconomicRestriction = (restriction: EconomicRestriction) => {
    const timeoutInHours = Math.ceil(restriction.ExpirationTimeInMinutes / 60);
    const violationKey =
      tradesConstants.economicRestrictionsViolationLabels[restriction.FailureReason]!;
    const violation = translate(violationKey);

    const body =
      timeoutInHours > 24
        ? translate("Text.EconomicRestrictionsDaysGeneral", {
            violation,
            day: Math.ceil(timeoutInHours / 24),
          })
        : translate("Text.EconomicRestrictionsHoursGeneral", { violation, hour: timeoutInHours });

    setEconomicBody(body);
    setDialog("economic");
  };

  // Explains the age check the trade API asked for before the shared flow takes
  // over. Guarded so a still-blocked retry surfaces an error instead of looping.
  const promptAgeCheck = (retryAccept: () => void) => {
    if (faeRetryAttemptedRef.current) {
      systemFeedbackService.warning(translate("Response.VerificationError"));
      return;
    }
    retryAcceptRef.current = retryAccept;
    setDialog("ageCheck");
  };

  // Handoff to the shared age-check flow, then replay the accept so the user
  // does not have to find the trade again. The guard is spent here rather than
  // when the prelude opens, so dismissing it leaves the accept retryable.
  const startAgeCheck = () => {
    setDialog(null);
    faeRetryAttemptedRef.current = true;
    const retryAccept = retryAcceptRef.current;
    startFacialAgeEstimation("accept-trade")
      .then(hasAccess => {
        if (hasAccess) {
          retryAccept?.();
        }
      })
      .catch((faeError: unknown) => {
        warn("startAgeCheck: FAE flow failed", faeError);
        sendAXError("facialAgeEstimation", faeError as Error, { source: "acceptTrade" });
        systemFeedbackService.warning(translate("Response.VerificationError"));
      });
  };

  const processAccept = () => {
    log("processAccept: accepting trade", trade.id);
    setProcessing(true);
    const eventParameters = { ...getTradeItemParameters(trade), tradeId: trade.id };

    acceptTrade(trade.id)
      .then(data => {
        log("processAccept: acceptTrade resolved", data);
        if (data.FailureReason !== undefined && data.ExpirationTimeInMinutes !== undefined) {
          showEconomicRestriction({
            FailureReason: data.FailureReason,
            ExpirationTimeInMinutes: data.ExpirationTimeInMinutes,
          });
          setProcessing(false);
          return;
        }

        setProcessing(false);
        systemFeedbackService.success(translate("Message.AcceptedTrade"));
        refreshCanTrade();
        onTradeRemoved(trade.id);
        sendEvent(tradeEvents.tradesList, "accept", eventParameters);
        sendAXEvent(tradeEvents.tradeCompleted, "accept", eventParameters);
      })
      .catch((error: unknown) => {
        const codes = getErrorCodes(error);
        warn("processAccept: acceptTrade failed", codes, error);
        sendAXError("accept", error as Error, { tradeId: trade.id });
        // The age-check block arrives as userCannotTrade, so confirm the
        // viewer's eligibility before choosing between the age-check flow and
        // the generic "cannot trade" message.
        if (codes.includes(tradesConstants.tradeErrors.userCannotTrade)) {
          setProcessing(false);
          resolveCannotTradeAction(error)
            .then(action => {
              if (action === "ageCheck") {
                promptAgeCheck(processAccept);
                return;
              }
              if (action === "upsell" && !isBlackbirdUser()) {
                setDialog("plusUpsell");
                return;
              }
              systemFeedbackService.warning(getCommonErrorMessage(codes, translate));
            })
            .catch(() => {
              systemFeedbackService.warning(getCommonErrorMessage(codes, translate));
            });
          return;
        }
        if (codes.includes(tradesConstants.tradeErrors.tradeFrictionEncountered)) {
          is2SVEnabled()
            .then(enabled => {
              if (enabled) {
                twoStepVerification.start();
              } else {
                setDialog("verificationRedirect");
              }
            })
            .catch(() => {
              setDialog("verificationRedirect");
            });
        } else {
          setProcessing(false);
          systemFeedbackService.warning(getCommonErrorMessage(codes, translate));
        }
      });
  };

  const processDecline = () => {
    log("processDecline: declining trade", trade.id);
    setProcessing(true);
    const eventParameters = { ...getTradeItemParameters(trade), tradeId: trade.id };

    declineTrade(trade.id)
      .then(() => {
        log("processDecline: declineTrade resolved");
        setProcessing(false);
        systemFeedbackService.success(translate("Message.DeclineTradeSuccess"));
        onTradeRemoved(trade.id);
        sendAXEvent(
          isOutbound ? tradeEvents.tradeCanceled : tradeEvents.tradeDeclined,
          isOutbound ? "cancel" : "decline",
          eventParameters,
        );
      })
      .catch((error: unknown) => {
        setProcessing(false);
        warn("processDecline: declineTrade failed", getErrorCodes(error), error);
        sendAXError(isOutbound ? "cancel" : "decline", error as Error, { tradeId: trade.id });
        systemFeedbackService.warning(getCommonErrorMessage(getErrorCodes(error), translate));
      });
  };

  const onCounter = () => {
    log("onCounter: countering trade", trade.id);
    sendEvent(tradeEvents.tradesList, "counter");
    // Counter is now a React view; navigate client-side (mirrors $state.go).
    navigate({ view: "counter", tradeId: trade.id });
  };

  const onAccept = () => {
    // Accepting completes a trade, so it draws on the monthly allowance. Pitch
    // the membership instead of walking the user through a confirmation the
    // server would only reject.
    if (tradeQuota.isOutOfTrades) {
      log("accept button clicked while out of trades, opening upsell");
      sendEvent(tradeEvents.tradesList, "acceptOutOfTradesUpsell");
      setDialog("plusUpsell");
      return;
    }

    log("accept button clicked, opening confirm dialog");
    faeRetryAttemptedRef.current = false;
    setDialog("accept");
  };

  return (
    <div>
      <h2 className="trades-header-nowrap font-title">
        {isMobile && (
          <IconButton
            className="trade-detail-back"
            icon="icon-regular-arrow-small-left"
            ariaLabel={translate("Action.Back")}
            variant="Utility"
            size="Small"
            onClick={onBack}
          />
        )}
        {trade.user ? (
          <a
            className="paired-name"
            href={`/users/${trade.user.id}/profile`}
            target="_blank"
            rel="noreferrer"
            aria-label={trade.user.nameForDisplay}
            onClick={() => {
              onProfileClick(trade, "detailHeader");
            }}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: translate("Label.TradeWithPartner", { username: trade.user.nameForDisplay }),
            }}
          />
        ) : (
          <span
            className="paired-name"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: translate("Label.TradeWithPartner", { username: "" }),
            }}
          />
        )}
      </h2>

      {isOpen && (
        <div className="text-label">
          {translate("Label.TradeExpiresOn", { date: "" })}
          {localizeDate(trade.expiration)}
        </div>
      )}

      {(!trade.offers || detailLoading) && (
        <div className="flex justify-center margin-y-large">
          <ProgressCircle
            ariaLabel={translate("Label.Loading", undefined, "Loading")}
            size="Medium"
            variant="Indeterminate"
          />
        </div>
      )}

      <div className="col-xs-12">
        {orderedOffers.map((offer, index) => (
          <TradeOffer
            // Partner user can be null (deleted/moderated); fall back to index.
            key={offer.user?.id ?? index}
            offer={offer}
            label={getOfferLabel(trade, offer, translate)}
          />
        ))}
      </div>

      {isOpen && (
        <div className="trade-buttons">
          {isInbound && (
            <Button variant="Emphasis" size="Medium" isDisabled={processing} onClick={onAccept}>
              {translate("Action.AcceptTrade")}
            </Button>
          )}
          {isInbound && trade.user && (
            <Button variant="Standard" size="Medium" isDisabled={processing} onClick={onCounter}>
              {translate("Action.CounterTrade")}
            </Button>
          )}
          {(isInbound || isOutbound) && (
            <Button
              variant="Standard"
              size="Medium"
              isDisabled={processing}
              onClick={() => {
                log("decline button clicked, opening confirm dialog");
                setDialog("decline");
              }}
            >
              {translate("Action.DeclineTrade")}
            </Button>
          )}
          {processing && (
            <span className="trade-buttons-loading">
              <ProgressCircle
                ariaLabel={translate("Label.Loading", undefined, "Loading")}
                size="Small"
                variant="Indeterminate"
              />
            </span>
          )}
        </div>
      )}

      <ConfirmDialog
        open={dialog === "accept"}
        title={translate("Header.AcceptTrade")}
        body={translate("Label.TradesAreFinalOnceComplete")}
        actionText={translate("Action.AcceptTrade")}
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
        onAction={() => {
          setDialog(null);
          processAccept();
        }}
        onCancel={() => {
          setDialog(null);
        }}
      />

      <ConfirmDialog
        open={dialog === "decline"}
        title={translate("Heading.DeclineTrade")}
        body={translate("Message.DeclineTrade")}
        actionText={translate("Action.DeclineTrade")}
        actionVariant="Emphasis"
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        footerNote={
          isInbound ? (
            <div
              className="text-footer"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: translate("Message.LowballTrades", {
                  startLink: `<a class="text-link" href="${tradesConstants.urls.privacySettings}">`,
                  endLink: "</a>",
                }),
              }}
            />
          ) : undefined
        }
        onAction={() => {
          setDialog(null);
          processDecline();
          sendEvent(tradeEvents.tradesList, "decline");
        }}
        onCancel={() => {
          setDialog(null);
        }}
      />

      <ConfirmDialog
        open={dialog === "economic"}
        title={translate("Heading.EconomicRestrictionsError")}
        body={economicBody}
        showAction={false}
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        onCancel={() => {
          setDialog(null);
        }}
      />

      <ConfirmDialog
        open={dialog === "verificationRedirect"}
        title={translate("Heading.TwoStepVerificationRequired")}
        body={translate("Message.TwoStepVerificationRequired")}
        actionText={translate("Action.GoToSecurity")}
        actionVariant="Emphasis"
        neutralText={translate("Action.Cancel")}
        closeLabel={translate("Action.Close")}
        onAction={() => {
          setDialog(null);
          redirectToSettings();
        }}
        onCancel={() => {
          setDialog(null);
          setProcessing(false);
        }}
      />

      <TradePlusUpsellSheet
        isOpen={dialog === "plusUpsell"}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setDialog(null);
          }
        }}
        onGetPlusClick={() => {
          sendEvent(tradeEvents.tradesList, "getPlusUpsell");
        }}
      />

      <TradeAgeCheckPrompt
        isOpen={dialog === "ageCheck"}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setDialog(null);
          }
        }}
        onContinue={startAgeCheck}
      />
    </div>
  );
};

export default TradeDetail;
