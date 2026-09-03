import React from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { translationConfig } from "../translation.config";
import { Product } from "../constants/TypeDefinitions";
import GiftProduct from "./GiftProduct";

type GiftProductSelectorProps = {
  productId: number | null;
  products: Product[];
  onSelectProduct: (productId: number | null) => void;
} & WithTranslationsProps;

const GiftProductSelector: React.FC<GiftProductSelectorProps> = ({
  productId,
  products,
  onSelectProduct,
}) => {
  return (
    <div id="gift-product-selector" role="listbox" className="gift-product-selector">
      {products.map(p => (
        <GiftProduct
          key={p.productId}
          productId={p.productId}
          price={p.price}
          amount={p.robuxAmount}
          isSelected={productId === p.productId}
          isPopular={p.isPopular}
          onSelect={onSelectProduct}
        />
      ))}
    </div>
  );
};

export default withTranslations(GiftProductSelector, translationConfig);
