import { ProductItemDefault, ProductItemDefaultProps } from "./ProductItemDefault";

export const withRedirectProductItem = (redirectUrl: string) => {
  const WrapperComponent = (componentProps: ProductItemDefaultProps) => (
    <ProductItemDefault
      {...componentProps}
      buttonProps={{
        className: componentProps.buttonProps?.className,
        as: "a",
        href: `${redirectUrl}&ap=${componentProps.product.productId}`,
        rel: "noreferrer",
        role: "button",
        target: "_blank",
      }}
    />
  );
  return WrapperComponent;
};
