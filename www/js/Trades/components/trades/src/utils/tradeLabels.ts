import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import tradesConstants from "../constants/tradesConstants";
import { TradeDetail, TradeOffer, TradeStatus } from "../types";

type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

/**
 * Whether the given offer belongs to the currently authenticated user. The
 * partner's `user` can be null (deleted/moderated account); such an offer is
 * never "mine", so a null user safely resolves to false.
 */
export const isMyOffer = (offer: TradeOffer): boolean => offer.user?.id === authenticatedUser()?.id;

/** Port of tradesListController.getTradeStatusLabel. */
export const getTradeStatusLabel = (status: TradeStatus, translate: TranslateFn): string => {
  const { tradeStatus } = tradesConstants;
  switch (status) {
    case tradeStatus.open:
      return translate("Label.TradeStatusOpen");
    case tradeStatus.pending:
      return translate("Label.TradeStatusPending");
    case tradeStatus.completed:
      return translate("Label.TradeStatusCompleted");
    case tradeStatus.expired:
      return translate("Label.TradeStatusExpired");
    case tradeStatus.declined:
      return translate("Label.TradeStatusDeclined");
    case tradeStatus.rejectedDueToError:
      return translate("Label.TradeStatusRejectedDueToError");
    case tradeStatus.countered:
      return translate("Label.TradeStatusCountered");
    case tradeStatus.processing:
      return translate("Label.TradeStatusProcessing");
    case tradeStatus.interventionRequired:
      return translate("Label.TradeStatusInterventionRequired");
    default:
      return translate("Label.TradeStatusUnknown");
  }
};

/** Port of tradesListController.getOfferLabel. */
export const getOfferLabel = (
  trade: TradeDetail,
  offer: TradeOffer,
  translate: TranslateFn,
): string => {
  const mine = isMyOffer(offer);
  const { tradeStatusType } = tradesConstants;

  switch (trade.tradeStatusType) {
    case tradeStatusType.completed:
      return translate(mine ? "Label.ItemsYouGave" : "Label.ItemsYouReceived");
    case tradeStatusType.inactive:
      return translate(mine ? "Label.ItemsWouldHaveGiven" : "Label.ItemsWouldHaveReceived");
    case tradeStatusType.inbound:
    case tradeStatusType.outbound:
    default:
      return translate(mine ? "Label.ItemsYouWillGive" : "Label.ItemsYouWillReceive");
  }
};
