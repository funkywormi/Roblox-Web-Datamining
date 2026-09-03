import React from "react";
import { TranslateFunction } from "react-utilities";
import { Tooltip } from "react-style-guide";
import { TRANSLATION_KEYS } from "@rbx/payments/creditCheckout";
import { PriceTag } from "@rbx/payments/priceTag";

type TContainerHeaderProps = {
  creditBalance: number;
  currencyCode: string;
  convertedRobuxAmount: number;
  translate: TranslateFunction;
};

function ContainerHeader({
  creditBalance,
  currencyCode,
  convertedRobuxAmount,
  translate,
}: TContainerHeaderProps) {
  const productPurchasable = convertedRobuxAmount === 0 && creditBalance > 0;
  return (
    <div className="hcc-container-header available-credit-label font-header-1 d-flex justify-content-start align-items-center">
      <span className="available-credit-label">
        {translate(TRANSLATION_KEYS.AvailableCreditLabel) || "Available Credit:"}
      </span>
      <PriceTag amount={creditBalance} currencyCode={currencyCode} tagClassName="font-header-1" />
      {productPurchasable && (
        <Tooltip
          id="available-credit-tooltip"
          placement="right"
          content={translate(TRANSLATION_KEYS.LargeCreditBalanceTooltipMessage)}
        >
          <span className="icon-moreinfo-16x16" />
        </Tooltip>
      )}
    </div>
  );
}

export default ContainerHeader;
