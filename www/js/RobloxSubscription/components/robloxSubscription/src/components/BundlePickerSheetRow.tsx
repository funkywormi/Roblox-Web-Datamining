import { useTranslation } from "@rbx/core-scripts/react";
import { Icon, OptionSelector } from "@rbx/foundation-ui";
import { translateHtml } from "@rbx/subscriptions-common";
import { useEffect } from "react";

import { Event } from "../utils/eventsCounter";
import { publishMetric } from "../utils/publishMetric";
import { getEntitledRobux } from "../utils/subscriptionProductInfo";

import type { SubscriptionProductInfo } from "@rbx/client-subscriptions-api/v1";
import type { FC } from "react";

type TierRowProps = {
  product: SubscriptionProductInfo;
  isSelected: boolean;
  onSelect: () => void;
  /** When true, this row is not the baseline (index 0) tier. */
  isBundle?: boolean;
};

const Content = ({
  product,
  isBundle,
}: {
  product: SubscriptionProductInfo;
  isBundle?: boolean;
}) => {
  const { translate, intl } = useTranslation();
  const robuxAllowance = getEntitledRobux(product);

  useEffect(() => {
    if (isBundle && robuxAllowance === 0) {
      publishMetric(Event.BUNDLE_PICKER_ROW_MISSING_ROBUX_ALLOWANCE, {
        productId: product.productKey.id,
      });
    }
    if (isBundle && !product.localizedStrikethroughPriceDisplayString) {
      publishMetric(Event.BUNDLE_PICKER_ROW_MISSING_STRIKETHROUGH_PRICE, {
        productId: product.productKey.id,
        currencyCode: product.localizedPrice.currencyCode,
      });
    }
  }, [
    isBundle,
    product.localizedPrice.currencyCode,
    product.localizedStrikethroughPriceDisplayString,
    product.productKey.id,
    robuxAllowance,
  ]);

  const localizedRobuxAllowance = intl.n(robuxAllowance);
  const productName =
    robuxAllowance > 0
      ? `${translate("Label.BlackbirdShort")} ${robuxAllowance}`
      : translate("Label.Blackbird");
  const localizedPrice = product.localizedPriceDisplayString;
  const strikethroughPriceDisplay = product.localizedStrikethroughPriceDisplayString;
  return (
    <div className="width-full min-height-700 flex flex-col items-stretch justify-center">
      <div className="width-full flex flex-row items-center justify-between">
        <span className="text-title-medium content-emphasis">{productName}</span>
        <div className="gap-small flex flex-row items-center justify-end">
          {strikethroughPriceDisplay && (
            <span className="text-body-medium strike-through" style={{ color: "#6a6f81" }}>
              {strikethroughPriceDisplay}
            </span>
          )}

          <span className="text-body-medium content-emphasis text-strikethrough">
            {localizedPrice}
          </span>
        </div>
      </div>
      {robuxAllowance > 0 && (
        <div className="width-full gap-xsmall flex flex-row items-center justify-start">
          <span className="text-body-medium content-default flex flex-row items-center">
            {translateHtml(
              translate,
              "Plus.LandingPage.BottomSheet.Benefit",
              [
                {
                  opening: "amountStart",
                  closing: "amountEnd",
                  render: text => (
                    <span className="padding-left-xxsmall gap-x-xxsmall flex flex-row items-center">
                      <Icon name="icon-regular-robux" size="XSmall" />
                      {text}
                    </span>
                  ),
                },
              ],
              {
                price: localizedRobuxAllowance,
              },
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const BundlePickerSheetRow: FC<TierRowProps> = ({ product, isSelected, onSelect, isBundle }) => {
  return (
    <div data-testid={`bundle-picker-tier-${product.productKey.id}`}>
      <OptionSelector
        hideSelectedIndicator
        isSelected={isSelected}
        label={undefined}
        layout="Horizontal"
        metadata={<Content isBundle={isBundle} product={product} />}
        size="XSmall"
        type="Checkmark"
        onSelect={onSelect}
      />
    </div>
  );
};

export default BundlePickerSheetRow;
