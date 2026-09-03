import { useMemo, useState, Fragment, useCallback } from "react";
import { Button, Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { Product } from "../../types/buyRobuxPageData";
import { trackCounter } from "../../observability";
import { ProductItemDefault, ProductItemDefaultProps } from "../ProductItem/ProductItemDefault";

type SectionBodyProductListProps = {
  onProductClick: ProductItemDefaultProps["onProductClick"];
  products: Product[];
  OverrideProductItemComponent?: React.ComponentType<ProductItemDefaultProps>;
};

export function SectionBodyProductList({
  onProductClick,
  products,
  OverrideProductItemComponent,
}: SectionBodyProductListProps) {
  const { translate } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  const hasCollapsible = useMemo(() => products.some(product => product.isCollapsible), [products]);

  const handleClick = useCallback(() => {
    trackCounter("ClickShowMore");
    setIsExpanded(prev => !prev);
  }, []);

  const ItemComponent = OverrideProductItemComponent ?? ProductItemDefault;

  return (
    <Fragment>
      {products.map(product => (
        <ItemComponent
          key={product.productId}
          product={product}
          isExpanded={isExpanded}
          onProductClick={onProductClick}
          buttonProps={{
            className: "min-width-[90px] small:min-width-[120px] medium:min-width-[200px]",
          }}
        />
      ))}
      {hasCollapsible && (
        <Button
          variant="ActionUtility"
          size="Small"
          className="self-stretch flex flex-row height-500"
          onClick={handleClick}
        >
          <div className="flex flex-row justify-center items-center gap-small text-title-medium content-default padding-none">
            {isExpanded ? translate("Action.ShowLess") : translate("Action.ShowMore")}
            {isExpanded ? (
              <Icon name="icon-filled-chevron-large-up" />
            ) : (
              <Icon name="icon-filled-chevron-large-down" />
            )}
          </div>
        </Button>
      )}
    </Fragment>
  );
}
