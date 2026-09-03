/* eslint-disable react/jsx-no-literals */
import { FC, useRef, useEffect } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { translationConfig } from "../translation.config";
import GiftMessageDropdown from "./GiftMessageDropdown";
import { Product } from "../constants/TypeDefinitions";
import GiftProductSelector from "./GiftProductSelector";
import { translations } from "../constants/Constants";

const {
  selectProduct: { key: selectProduct, default: selectProductDefault },
  selectMessage: { key: selectMessage, default: selectMessageDefault },
  optional: { key: optional, default: optionalDefault },
  checkout: { key: checkout, default: checkoutDefault },
  checkoutDescription: { key: checkoutDescription, default: checkoutDescriptionDefault },
} = translations;

const NAVIGATION_BAR_HEIGHT = 100;

type GiftingProductsCheckoutProps = {
  productId: number | null;
  products: Product[];
  message: string;
  messages: string[];
  onCheckout: () => void;
  onSelectMessage: (message: string) => void;
  onSelectProduct: (productId: number | null) => void;
} & WithTranslationsProps;

const GiftingProductsCheckout: FC<GiftingProductsCheckoutProps> = ({
  translate,
  productId,
  products,
  message,
  messages,
  onSelectMessage,
  onSelectProduct,
  onCheckout,
}) => {
  const giftMessageSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (productId && giftMessageSectionRef.current) {
      const top =
        giftMessageSectionRef.current.getBoundingClientRect().top +
        window.scrollY -
        NAVIGATION_BAR_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [productId]);

  return (
    <div className="gifting-products-checkout-container">
      <section>
        <h1>{`1. ${translate(selectProduct) || selectProductDefault}`}</h1>
        <GiftProductSelector
          productId={productId}
          products={products}
          onSelectProduct={onSelectProduct}
        />
      </section>
      <section ref={giftMessageSectionRef}>
        <h1>
          {`2. ${translate(selectMessage) || selectMessageDefault} `}
          <span className="optional-text">{translate(optional) || optionalDefault}</span>
        </h1>
        <GiftMessageDropdown
          selectedMessage={message}
          messages={messages}
          onSelectGiftMessage={onSelectMessage}
        />
      </section>
      <section>
        <h1>{`3. ${translate(checkout) || checkoutDefault}`}</h1>
        <p>{translate(checkoutDescription) || checkoutDescriptionDefault}</p>
      </section>
      <Button
        isDisabled={productId === null}
        className="get-started-button"
        size={Button.sizes.large}
        variant={Button.variants.growth}
        onClick={onCheckout}
      >
        {translate(checkout) || checkoutDefault}
      </Button>
    </div>
  );
};

export default withTranslations(GiftingProductsCheckout, translationConfig);
