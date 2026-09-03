import tradesConstants from "../constants/tradesConstants";

type TranslateFn = (key: string, params?: Record<string, unknown>) => string;

// Port of the common error mapping in
// js/angular/trades/services/tradesErrorService.js.
const errorCodes = {
  inactiveTrade: 3,
  unauthorized: 4,
  tradeSystemUnavailable: 5,
  needsConfirmation: 6,
  userCannotTrade: 7,
  invalidTrade: 2,
  invalidPartner: 10,
  tradeFrictionEncountered: 23,
};

/** Maps the primary API error code to a translated, user-facing message. */
export const getCommonErrorMessage = (codes: number[], translate: TranslateFn): string => {
  const code = codes[0];
  switch (code) {
    case errorCodes.invalidTrade:
    case errorCodes.unauthorized:
      return translate("Error.TradeUnauthorized");
    case errorCodes.needsConfirmation:
      return translate("Error.WaitingForConfirmation");
    case errorCodes.invalidPartner:
      return translate("Error.InvalidTradePartner");
    case errorCodes.userCannotTrade:
      return translate("Error.TradeUsersCannotTrade");
    case errorCodes.inactiveTrade:
      return translate("Error.TradeInactive");
    case errorCodes.tradeSystemUnavailable:
      return translate("Error.TradeSystemUnavailable");
    case errorCodes.tradeFrictionEncountered:
      return translate("Error.TradeFrictionEncountered");
    default:
      return translate("Error.TradeUnknownError");
  }
};

/**
 * Maps an invalid tradable-item reason to a translated label. Port of
 * tradesErrorService.getInvalidTradableItemLabel.
 */
export const getInvalidTradableItemLabel = (
  reason: string | null | undefined,
  translate: TranslateFn,
): string => {
  const reasons = tradesConstants.invalidUserAssetReason;
  switch (reason) {
    case reasons.doesNotExist:
      return translate("Error.UserAssetDoesNotExist");
    case reasons.notOwned:
      return translate("Error.UserAssetNotOwned");
    case reasons.recipientNeedsMembership:
    case reasons.recipientNeedsHigherMembershipType:
      return translate("Error.RequiresPremiumMembership");
    case reasons.contentRatingRestricted:
      return translate("Error.UserAssetContentRestricted");
    case reasons.notTradeable:
      return translate("Error.UserAssetNotTradeable");
    default:
      return translate("Error.UserAssetUnknownError");
  }
};
