import * as React from "react";
import { uuidService } from "core-utilities";
import { usePrepareGiftRobuxCheckoutMutation } from "../../apis/giftRobuxProductsApi";
import type {
  TGiftRobuxProduct,
  TPrepareGiftRobuxCheckoutResponse,
} from "../../apis/giftRobuxProductsApi";
import { trackCounter } from "../giftRobux/observability";

type PrepareCheckoutFailureType =
  | "requestError"
  | "recipientGiftLimitExceeded"
  | "serverRejected"
  | "malformedSuccess";

export type GiftRobuxCheckoutResult =
  | {
      type: "redirect";
      checkoutUrl: string;
    }
  | {
      type: PrepareCheckoutFailureType;
    };

const defaultGiftMessageForRecipientTranslationKey = "Message.Gifting.GiftMessage1";

const classifyGiftRobuxCheckoutResponse = (
  response: Partial<TPrepareGiftRobuxCheckoutResponse>,
): GiftRobuxCheckoutResult => {
  const checkoutUrl = response.providerPayload?.checkoutUrl;

  if (response.isSuccess === true && typeof checkoutUrl === "string" && checkoutUrl !== "") {
    return {
      type: "redirect",
      checkoutUrl,
    };
  }

  if (response.isSuccess === false) {
    return {
      type:
        response.failureReason === "BlockedReceiverGiftLimitExceeded"
          ? "recipientGiftLimitExceeded"
          : "serverRejected",
    };
  }

  return {
    type: "malformedSuccess",
  };
};

const trackPrepareCheckoutFailed = (failureType: PrepareCheckoutFailureType): void => {
  trackCounter("PrepareCheckoutFailed", { failureType });
};

export type UseGiftRobuxCheckoutResult = {
  isPreparingCheckout: boolean;
  prepareCheckout: (product: TGiftRobuxProduct) => Promise<GiftRobuxCheckoutResult>;
};

const useGiftRobuxCheckout = (recipientUserId: number): UseGiftRobuxCheckoutResult => {
  const [prepareGiftRobuxCheckout, { isLoading: isPreparingCheckout }] =
    usePrepareGiftRobuxCheckoutMutation();

  const prepareCheckout = React.useCallback(
    async (product: TGiftRobuxProduct): Promise<GiftRobuxCheckoutResult> => {
      trackCounter("PrepareCheckoutStarted");

      try {
        const response = await prepareGiftRobuxCheckout({
          preparePaymentRequest: {
            paymentMethod: "StripeCard",
            productId: product.productId,
          },
          messageForRecipientTranslationKey: defaultGiftMessageForRecipientTranslationKey,
          idempotencyKey: uuidService.generateRandomUuid(),
          verifiedPhoneId: null,
          recipientUserId,
          isFromParentalControls: true,
        }).unwrap();
        const outcome = classifyGiftRobuxCheckoutResponse(response);

        if (outcome.type === "redirect") {
          trackCounter("PrepareCheckoutSuccess");
        } else {
          trackPrepareCheckoutFailed(outcome.type);
        }

        return outcome;
      } catch {
        trackPrepareCheckoutFailed("requestError");
        return {
          type: "requestError",
        };
      }
    },
    [prepareGiftRobuxCheckout, recipientUserId],
  );

  return {
    isPreparingCheckout,
    prepareCheckout,
  };
};

export default useGiftRobuxCheckout;
