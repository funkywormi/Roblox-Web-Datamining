import classNames from "classnames";
import { Button, TButtonProps } from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { Product } from "../../types/buyRobuxPageData";
import { RobuxAmount } from "../sections/RobuxAmount";
import { formatAmount } from "../../utils/formatMoney";
import { getRobuxProductTrackingProps } from "../../hooks/useScrollTracking";

// TODO: Make @rbx/foundation-ui Button Next.js SSR compatible so `size` can follow the
// viewport and this override can go away. `size="Small"` is the base; from `small` (361px)
// these classes match Medium, including the icon Button renders inside itself.
const mediumFromSmallClassName =
  "small:height-1000 small:padding-x-medium small:text-label-medium small:[&_.icon]:size-[var(--icon-size-medium)] small:[&>span]:gap-small";

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
        size="Small"
        className={classNames(
          buttonClassName,
          "text-label-medium shrink-0",
          mediumFromSmallClassName,
        )}
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
