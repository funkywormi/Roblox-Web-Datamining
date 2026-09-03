import React, { useCallback, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Button,
  Icon,
  ProgressCircle,
  SheetBody,
  SheetContent,
  SheetRoot,
  SheetTitle,
} from "@rbx/foundation-ui";
import { PriceTag } from "@rbx/payments/priceTag";
import { formatNumber } from "@rbx/core-scripts/format/number";
import type { TGiftRobuxProduct } from "../../../../apis/giftRobuxProductsApi";
import type { TChildInfo } from "../../../../../types/childrenInfoTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import type { GiftRobuxCheckoutResult } from "../../../hooks/useGiftRobuxCheckout";
import useGiftRobuxCheckout from "../../../hooks/useGiftRobuxCheckout";
import useGiftRobuxProducts from "../../../hooks/useGiftRobuxProducts";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import { trackCounter } from "../../../giftRobux/observability";

type GiftRobuxProductItemProps = {
  product: TGiftRobuxProduct;
  isDisabled: boolean;
  onCheckout: (product: TGiftRobuxProduct) => void | Promise<void>;
};

const GiftRobuxProductItem = ({
  product,
  isDisabled,
  onCheckout,
}: GiftRobuxProductItemProps): React.JSX.Element => {
  return (
    <div className="flex height-1000 items-center gap-small self-stretch">
      <div className="flex items-center gap-xsmall grow-1 shrink-0 basis-0">
        <Icon name="icon-filled-robux" size="Medium" />
        <span className="text-heading-small content-emphasis text-no-wrap text-truncate-end text-align-x-center">
          {formatNumber(product.robuxAmount)}
        </span>
      </div>
      <Button
        variant={product.isPopular ? "Emphasis" : "Standard"}
        size="Medium"
        className="min-width-[90px] small:min-width-[120px] medium:min-width-[160px] text-label-medium shrink-0"
        isDisabled={isDisabled}
        onClick={() => {
          // eslint-disable-next-line no-void
          void onCheckout(product);
        }}
      >
        <PriceTag
          amount={product.price.amount}
          currencyCode={product.price.currency.currencyCode}
          tagClassName="text-label-medium text-truncate-end text-no-wrap text-align-x-center"
        />
      </Button>
    </div>
  );
};

type GiftRobuxSheetProps = {
  child: TChildInfo;
};

type CheckoutFailureType = Exclude<GiftRobuxCheckoutResult["type"], "redirect">;

const checkoutFailurePresentation = {
  recipientGiftLimitExceeded: {
    errorType: "giftLimitReached",
    messageKey: "Message.Error.RecipientDailyLimit",
  },
  malformedSuccess: {
    errorType: "missingCheckoutUrl",
    messageKey: "Message.Error.Default",
  },
  serverRejected: {
    errorType: "checkoutFailed",
    messageKey: "Message.Error.Default",
  },
  requestError: {
    errorType: "checkoutFailed",
    messageKey: "Message.Error.Default",
  },
} satisfies Record<CheckoutFailureType, { errorType: string; messageKey: string }>;

const GiftRobuxSheet = ({ child }: GiftRobuxSheetProps): React.JSX.Element => {
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { translate } = useTranslation();
  const { isPreparingCheckout, prepareCheckout } = useGiftRobuxCheckout(child.userId);
  const { isError, isFetching, isUninitialized, loadProducts, products } = useGiftRobuxProducts();
  const { giftRobux } = parentalControlsTranslationConstants;

  const handleLoadProducts = useCallback(async () => {
    const outcome = await loadProducts();

    if (outcome === "empty" || outcome === "error") {
      parentalControlsEventService.authMsgShownSettingsPControlsGiftRobuxError(
        child,
        outcome === "empty" ? "noProducts" : "productsFetchFailed",
      );
    }
  }, [child, loadProducts]);

  const handleOpen = useCallback(() => {
    setCheckoutError(null);
    parentalControlsEventService.authButtonClickSettingsPControlsGiftRobuxOpen(child);
    trackCounter("SheetOpened");
    // Intentionally fire-and-forget the product fetch before opening the sheet.
    // eslint-disable-next-line no-void
    void handleLoadProducts();
    setIsOpen(true);
  }, [child, handleLoadProducts]);

  const handleOpenChange = useCallback(
    (nextIsOpen: boolean) => {
      if (isOpen && !nextIsOpen) {
        trackCounter("SheetClosed");
      }

      setIsOpen(nextIsOpen);
    },
    [isOpen],
  );

  const handleCheckout = useCallback(
    async (product: TGiftRobuxProduct) => {
      setCheckoutError(null);
      parentalControlsEventService.authButtonClickSettingsPControlsGiftRobuxCheckout(
        child,
        product.productId,
      );
      const outcome = await prepareCheckout(product);

      if (outcome.type === "redirect") {
        trackCounter("CheckoutRedirect");
        window.location.href = outcome.checkoutUrl;
        return;
      }

      const failurePresentation = checkoutFailurePresentation[outcome.type];

      parentalControlsEventService.authMsgShownSettingsPControlsGiftRobuxError(
        child,
        failurePresentation.errorType,
      );
      setCheckoutError(translate(failurePresentation.messageKey));
    },
    [child, prepareCheckout, translate],
  );

  let sheetBody: React.JSX.Element;

  const retryButton = (
    <Button
      variant="Standard"
      size="Medium"
      className="shrink-0"
      isDisabled={isFetching}
      onClick={() => {
        // eslint-disable-next-line no-void
        void handleLoadProducts();
      }}
    >
      {translate("Action.TryAgain")}
    </Button>
  );

  if (isFetching || isUninitialized) {
    sheetBody = (
      <div className="flex width-full justify-center padding-y-large">
        <ProgressCircle
          ariaLabel={translate("Label.Loading")}
          size="Medium"
          variant="Indeterminate"
        />
      </div>
    );
  } else if (isError || !products?.length) {
    sheetBody = (
      <div className="flex flex-col gap-medium" role="alert">
        <span>
          {translate(
            isError ? "Message.Error.LoadRobuxPackagesFailed" : "Message.Error.NoRobuxPackages",
          )}
        </span>
        {retryButton}
      </div>
    );
  } else {
    sheetBody = (
      <React.Fragment>
        <span>
          {translate(giftRobux.selectPackageDescription, {
            recipientUsername: child.userName,
          })}
        </span>
        <div className="radius-large stroke-standard stroke-default flex padding-xlarge flex-col items-start gap-large self-stretch">
          {products.map(product => (
            <GiftRobuxProductItem
              key={product.productId}
              product={product}
              isDisabled={isPreparingCheckout}
              onCheckout={handleCheckout}
            />
          ))}
        </div>
        {checkoutError && (
          <span className="content-system-alert" role="alert">
            {checkoutError}
          </span>
        )}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Button variant="Standard" size="Medium" className="shrink-0" onClick={handleOpen}>
        {translate(giftRobux.addRobuxAction)}
      </Button>
      <SheetRoot open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          centerSheetSize="Medium"
          closeLabel={translate("Action.Close")}
          largeScreenVariant="center"
        >
          <SheetTitle>{translate(giftRobux.addRobuxAction)}</SheetTitle>
          <SheetBody>
            <div className="text-body-medium flex flex-col gap-medium padding-bottom-xlarge">
              {sheetBody}
            </div>
          </SheetBody>
        </SheetContent>
      </SheetRoot>
    </React.Fragment>
  );
};

export default GiftRobuxSheet;
