import { useCallback, useState } from "react";
import { paymentFlowAnalyticsService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { CardType, RecipientType } from "../constants/shopGiftcardsConstants";

export type UseGiftCardAnalyticsResponse = {
  trackLanding: (locationStr: string, refStr: string, initialBalance: number) => void;
  trackSetCardBalance: (balance: number) => void;
  trackSetCardType: (type: CardType) => void;
  trackSetRecipientType: (type: RecipientType) => void;
  trackAddToCart: () => void;
};

const useGiftCardAnalytics = (): UseGiftCardAnalyticsResponse => {
  const [location, setLocation] = useState<string>("");
  const [ref, setRef] = useState<string>("");
  const [cardBalance, setCardBalance] = useState<string>("");
  const [cardType, setCardType] = useState<CardType>(CardType.Digital);
  const [recipientType, setRecipientType] = useState<RecipientType>(RecipientType.Self);

  const {
    ENUM_TRIGGERING_CONTEXT: { WEB_GIFT_CARD_PURCHASE },
    ENUM_VIEW_NAME: { SHOP_GIFT_CARDS },
    ENUM_PURCHASE_EVENT_TYPE: { USER_INPUT, VIEW_SHOWN },
    ENUM_VIEW_MESSAGE: {
      ADD_TO_CART,
      GIFT_CARD_AMOUNT_BUTTON,
      GIFT_CARD_TYPE_BUTTON,
      GIFT_CARD_RECIPIENT_TYPE_BUTTON,
    },
  } = paymentFlowAnalyticsService;

  const trackLanding = useCallback(
    (locationStr: string, refStr: string, balance: number) => {
      const balanceStr = balance.toString();
      setLocation(locationStr);
      setRef(refStr);
      setCardBalance(balanceStr);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_GIFT_CARD_PURCHASE,
        true,
        SHOP_GIFT_CARDS,
        VIEW_SHOWN,
        undefined,
        {
          location: locationStr,
          ref: refStr,
          cardBalance: balanceStr,
          cardType,
          recipientType,
        },
      );
    },
    [WEB_GIFT_CARD_PURCHASE, SHOP_GIFT_CARDS, VIEW_SHOWN, cardType, recipientType],
  );

  const trackSetCardBalance = useCallback(
    (balance: number) => {
      const balanceStr = balance.toString();
      setCardBalance(balanceStr);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_GIFT_CARD_PURCHASE,
        false,
        SHOP_GIFT_CARDS,
        USER_INPUT,
        GIFT_CARD_AMOUNT_BUTTON,
        {
          location,
          ref,
          cardBalance: balanceStr,
          cardType,
          recipientType,
        },
      );
    },
    [
      WEB_GIFT_CARD_PURCHASE,
      SHOP_GIFT_CARDS,
      USER_INPUT,
      GIFT_CARD_AMOUNT_BUTTON,
      location,
      ref,
      cardType,
      recipientType,
    ],
  );

  const trackSetCardType = useCallback(
    (type: CardType) => {
      setCardType(type);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_GIFT_CARD_PURCHASE,
        false,
        SHOP_GIFT_CARDS,
        USER_INPUT,
        GIFT_CARD_TYPE_BUTTON,
        {
          location,
          ref,
          cardBalance,
          cardType: type,
          recipientType,
        },
      );
    },
    [
      WEB_GIFT_CARD_PURCHASE,
      SHOP_GIFT_CARDS,
      USER_INPUT,
      GIFT_CARD_TYPE_BUTTON,
      location,
      ref,
      cardBalance,
      recipientType,
    ],
  );

  const trackSetRecipientType = useCallback(
    (type: RecipientType) => {
      setRecipientType(type);

      paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
        WEB_GIFT_CARD_PURCHASE,
        false,
        SHOP_GIFT_CARDS,
        USER_INPUT,
        GIFT_CARD_RECIPIENT_TYPE_BUTTON,
        {
          location,
          ref,
          cardBalance,
          cardType,
          recipientType: type,
        },
      );
    },
    [
      WEB_GIFT_CARD_PURCHASE,
      SHOP_GIFT_CARDS,
      USER_INPUT,
      GIFT_CARD_RECIPIENT_TYPE_BUTTON,
      location,
      ref,
      cardBalance,
      cardType,
    ],
  );

  const trackAddToCart = useCallback(() => {
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      WEB_GIFT_CARD_PURCHASE,
      false,
      SHOP_GIFT_CARDS,
      USER_INPUT,
      ADD_TO_CART,
      {
        location,
        ref,
        cardBalance,
        cardType,
        recipientType,
      },
    );
  }, [
    WEB_GIFT_CARD_PURCHASE,
    SHOP_GIFT_CARDS,
    USER_INPUT,
    ADD_TO_CART,
    location,
    ref,
    cardBalance,
    cardType,
    recipientType,
  ]);

  return {
    trackLanding,
    trackSetCardBalance,
    trackSetCardType,
    trackAddToCart,
    trackSetRecipientType,
  };
};

export default useGiftCardAnalytics;
