import classNames from "classnames";
import { Button, TButtonProps } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { useResponsiveValue } from "@rbx/payments/hooks";
import { Product } from "../../types/buyRobuxPageData";
import { RobuxAmount } from "../sections/RobuxAmount";
import { formatAmount } from "../../utils/formatMoney";
import { getRobuxProductTrackingProps } from "../../hooks/useScrollTracking";

export type ProductItemDefaultProps = {
  product: Product;
  isExpanded: boolean;
  onProductClick: (
    product: Product,
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  buttonProps?: TButtonProps;
};

export const ProductItemDefault = ({
  product,
  isExpanded,
  onProductClick,
  buttonProps,
}: ProductItemDefaultProps) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    onProductClick(product, event);
  };

  const { className: buttonClassName, ...restButtonProps } = buttonProps ?? {};

  const buttonSize = useResponsiveValue("Small" as const, {
    small: "Medium" as const,
  });

  return (
    <div
      key={product.productId}
      {...getRobuxProductTrackingProps(product.productId)}
      className={classNames("self-stretch flex flex-row justify-between items-center gap-small", {
        hidden: product.isCollapsible && !isExpanded,
      })}
    >
      <RobuxAmount
        amount={product.robuxAmount}
        nonPromotionalAmount={product.nonPromotionalPlatformRobuxAmount}
        bonusRobuxAmount={product.bonusRobuxAmount}
        bonusRobuxTagIcon={product.bonusRobuxTagIcon}
        bonusRobuxTagTranslationKey={product.bonusRobuxTagTranslationKey}
        inlineBadgeIcon={product.inlineBadgeIcon}
        inlineBadgeTranslationKey={product.inlineBadgeTranslationKey}
      />

      <Button
        variant={product.isCallToAction ? "Emphasis" : "Standard"}
        size={buttonSize}
        className={classNames(buttonClassName, "text-label-medium shrink-0")}
        onClick={handleClick}
        {...restButtonProps}
        icon={
          restButtonProps.as === "a" && restButtonProps.href
            ? "icon-regular-arrow-up-right-from-square"
            : undefined
        }
      >
        <PriceTag
          tagClassName="robux-price-tag"
          currencyCode={product.price.amount.currencyCode}
          amount={Number(formatAmount(product.price.amount))}
        />
      </Button>
    </div>
  );
};
