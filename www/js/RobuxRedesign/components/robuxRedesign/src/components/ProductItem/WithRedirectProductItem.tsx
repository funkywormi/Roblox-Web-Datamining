import { earlyClickRedirectHref } from "../../modules/earlyClick";
import { ProductItemDefault, ProductItemDefaultProps } from "./ProductItemDefault";

export const withRedirectProductItem = (redirectUrl: string) => {
  const WrapperComponent = (componentProps: ProductItemDefaultProps) => (
    <ProductItemDefault
      {...componentProps}
      buttonProps={{
        className: componentProps.buttonProps?.className,
        as: "a",
        href: earlyClickRedirectHref(
          `${redirectUrl}&ap=${componentProps.product.productId}`,
          Boolean(redirectUrl),
        ),
        rel: "noreferrer",
        role: "button",
        target: "_blank",
      }}
    />
  );
  return WrapperComponent;
};
