import React, { useEffect, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import tradesConstants from "../constants/tradesConstants";
import { canTrade } from "../services/tradesApi";
import { sendAXEvent, tradeEvents } from "../services/tradeEvents";

const MONEY_PAGE_BANNER_KEY = "rbx.HideMoneyPageBanner";
const REGIONAL_RESTRICTIONS_BANNER_KEY = "rbx.HideRegionalRestrictionsBanner";

const isBannerHidden = (key: string): boolean => {
  try {
    return Boolean(window.localStorage) && window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
};

const hideBanner = (key: string): void => {
  try {
    window.localStorage?.setItem(key, "true");
  } catch {
    // localStorage unavailable; banner will simply reappear next load.
  }
};

/**
 * Page-level banners previously owned by the Angular tradesController shell:
 * the "transactions moved" money-page notice and the regional-restrictions
 * notice. Dismissals persist in localStorage and emit the bannerDismiss event.
 */
export const TradeBanners = (): JSX.Element => {
  const { translate } = useTranslation();
  const [showMoneyPage, setShowMoneyPage] = useState(!isBannerHidden(MONEY_PAGE_BANNER_KEY));
  const [hasRegionalRestrictions, setHasRegionalRestrictions] = useState(false);
  const [regionalDismissed, setRegionalDismissed] = useState(
    isBannerHidden(REGIONAL_RESTRICTIONS_BANNER_KEY),
  );

  useEffect(() => {
    canTrade()
      .then(response => {
        setHasRegionalRestrictions(
          response?.tradeEligibility ===
            tradesConstants.tradeEligibility.legalOrRegulatoryRestrictions,
        );
      })
      .catch(() => {
        setHasRegionalRestrictions(false);
      });
  }, []);

  const closeMoneyPageBanner = () => {
    setShowMoneyPage(false);
    sendAXEvent(tradeEvents.bannerDismiss, "close", { banner: "moneyPage" });
    hideBanner(MONEY_PAGE_BANNER_KEY);
  };

  const closeRegionalRestrictionsBanner = () => {
    setRegionalDismissed(true);
    sendAXEvent(tradeEvents.bannerDismiss, "close", { banner: "regionalRestrictions" });
    hideBanner(REGIONAL_RESTRICTIONS_BANNER_KEY);
  };

  const showRegional = hasRegionalRestrictions && !regionalDismissed;

  return (
    <React.Fragment>
      {showMoneyPage && (
        <div className="message-banner money-page-banner">
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: translate("Message.TransactionsAndSummaryMoved", {
                robuxIcon: "<span class='icon-robux-gray-16x16'></span>",
              }),
            }}
          />
          <span
            className="icon-close cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={translate("Action.Close")}
            onClick={closeMoneyPageBanner}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                closeMoneyPageBanner();
              }
            }}
          />
        </div>
      )}

      {showRegional && (
        <div className="message-banner regional-restrictions-banner">
          <span>{translate("Error.TradeRestrictedByRegionalRestrictions")}</span>
          <span
            className="icon-close cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={translate("Action.Close")}
            onClick={closeRegionalRestrictionsBanner}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                closeRegionalRestrictionsBanner();
              }
            }}
          />
        </div>
      )}
    </React.Fragment>
  );
};

export default TradeBanners;
