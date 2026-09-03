import { formatNumber } from "@rbx/core-scripts/format/number";
import { useTranslation } from "@rbx/core-scripts/react";
import { TradeOffer as TradeOfferType } from "../types";
import { calculateOfferValue, calculateRobuxMinusFee, getFeeAsPercent } from "../utils/tradesUtils";
import TradeItemCard from "./TradeItemCard";

export type TradeOfferProps = {
  offer: TradeOfferType;
  label: string;
};

/** One side of a trade: header, item cards, and value/robux summary lines. */
export const TradeOffer = ({ offer, label }: TradeOfferProps): JSX.Element => {
  const { translate } = useTranslation();
  const hasRobux = Boolean(offer.robux && offer.robux > 0);

  return (
    <div className="trade-list-detail-offer">
      <div className="rbx-divider" />
      <h3 className="trade-list-detail-offer-header font-header-1">{label}</h3>

      <ul className="hlist item-cards item-cards-stackable">
        {offer.items.map(item => (
          <li key={item.collectibleItemInstanceId} className="list-item item-card trade-item-card">
            <TradeItemCard item={item} />
          </li>
        ))}
      </ul>

      <div>
        {hasRobux && (
          <div className="robux-line">
            <span className="text-label">
              {translate("Label.RobuxOfferedAfterFee", { percent: `${getFeeAsPercent()}` })}
            </span>
            <span className="robux-line-amount">
              <span className="icon-robux-gray-16x16" />
              <span className="text-label robux-line-value">
                {formatNumber(calculateRobuxMinusFee(offer.robux))}
              </span>
            </span>
          </div>
        )}

        <div className="robux-line">
          <span className="text-lead">{translate("Label.TotalValue")}</span>
          <span className="robux-line-amount">
            <span className="icon-robux-16x16" />
            <span className="text-robux-lg robux-line-value">
              {formatNumber(calculateOfferValue(offer))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TradeOffer;
