import React from "react";
import classNames from "classnames";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { PriceTag } from "@rbx/payments/priceTag";
import { formatIntlNumber } from "@rbx/payments/utils";
import { translationConfig } from "../translation.config";
import { Price } from "../constants/TypeDefinitions";
import { translations } from "../constants/Constants";

const {
  robux: { key: robux, default: robuxDefault },
  mostPopular: { key: mostPopular, default: mostPopularDefault },
} = translations;

type GiftProduct = {
  productId: number;
  price: Price;
  amount: number;
  isSelected: boolean;
  isPopular: boolean;
  onSelect: (productId: number) => void;
} & WithTranslationsProps;

const GiftProductContainer: React.FC<GiftProduct> = ({
  productId,
  price,
  amount,
  onSelect,
  isSelected,
  isPopular,
  translate,
}) => {
  return (
    <button
      role="option"
      aria-selected={isSelected}
      className={classNames("gift-product", { selected: isSelected, popular: isPopular })}
      type="button"
      onClick={() => {
        onSelect(productId);
      }}
    >
      <div className="gift-product-content">
        <div className="robux-amount">
          <div className="robux-amount-row">
            <div className="robux-value">
              <span
                className={
                  document.body.classList.contains("dark-theme")
                    ? "icon-robux-white"
                    : "icon-robux-gray"
                }
              />
              <h4 className="inline-text">{formatIntlNumber(amount)}</h4>
            </div>
            {isPopular && (
              <span className="highlight-badge light-theme">
                <span className="icon-popular" />
                <span className="font-caption-header fluid-highlight-text">
                  {translate(mostPopular) || mostPopularDefault}
                </span>
              </span>
            )}
          </div>
          <div className="robux-amount-row">{translate(robux) || robuxDefault}</div>
        </div>
        <PriceTag amount={price.amount} currencyCode={price.currency.currencyCode} />
      </div>
    </button>
  );
};

export default withTranslations(GiftProductContainer, translationConfig);
