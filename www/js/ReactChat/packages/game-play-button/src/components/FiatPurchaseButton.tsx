import React, { useCallback, useState } from "react";
import { ValidHttpUrl, isValidStripeCheckoutUrl } from "@rbx/core-scripts/util/url";
import { Button } from "@rbx/core-ui/legacy/react-style-guide";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import playButtonService from "../services/playButtonService";
import { TGetProductDetails, ValueOf, type TPlayButtonPageContext } from "../types/playButtonTypes";
import { sendUnlockPlayIntentEvent } from "../utils/playButtonUtils";
import PurchaseButtonUI from "./PurchaseButtonUI";

const { counterEvents, unlockPlayIntentConstants, playButtonTextTranslationMap } =
  playButtonConstants;

type TFiatPurchaseButtonProps = {
  universeId: string;
  placeId: string;
  productDetails: TGetProductDetails;
  translate: TranslateFunction;
  iconClassName?: string;
  buttonWidth?: ValueOf<typeof Button.widths>;
  buttonClassName?: string;
  hideButtonText?: boolean;
  redirectPurchaseUrl?: ValidHttpUrl;
  showDefaultPurchaseText?: boolean;
  pageContext: TPlayButtonPageContext;
};

const FiatPurchaseButton: React.FC<TFiatPurchaseButtonProps> = ({
  universeId,
  placeId,
  productDetails,
  translate,
  iconClassName,
  buttonWidth,
  buttonClassName,
  hideButtonText,
  redirectPurchaseUrl,
  showDefaultPurchaseText = false,
  pageContext,
}) => {
  const [isPurchasing, setIsPurchasing] = useState(false);

  const startFiatPurchase = useCallback(
    async (ev: React.MouseEvent<HTMLButtonElement>) => {
      ev.preventDefault();
      ev.stopPropagation();
      const basePriceId = productDetails.fiatPurchaseData?.basePriceId;
      if (!placeId || !basePriceId) {
        return;
      }
      setIsPurchasing(true);
      try {
        sendUnlockPlayIntentEvent(
          universeId,
          unlockPlayIntentConstants.fiatPurchaseUpsellName,
          PlayabilityStatus.FiatPurchaseRequired,
          pageContext,
        );
        const stripeUrl = await playButtonService.getFiatPurchaseUrl(placeId, basePriceId);
        if (stripeUrl && isValidStripeCheckoutUrl(stripeUrl)) {
          window.location.href = stripeUrl;
        }
      } catch {
        window.EventTracker?.fireEvent(counterEvents.PreparePurchaseUrlError);
        console.error("Error preparing purchase url");
      } finally {
        setIsPurchasing(false);
      }
    },
    [placeId, productDetails, universeId, pageContext],
  );

  return (
    <PurchaseButtonUI
      buttonWidth={buttonWidth}
      buttonClassName={buttonClassName}
      iconClassName={iconClassName}
      hideButtonText={hideButtonText}
      hideButtonIcon
      buttonContent={
        showDefaultPurchaseText
          ? translate(playButtonTextTranslationMap.Buy)
          : (productDetails.fiatPurchaseData?.localizedFiatPrice ?? "")
      }
      // TODO: old, migrated code
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={redirectPurchaseUrl ? undefined : startFiatPurchase}
      redirectUrl={redirectPurchaseUrl}
      isPurchasing={isPurchasing}
    />
  );
};

export default FiatPurchaseButton;
