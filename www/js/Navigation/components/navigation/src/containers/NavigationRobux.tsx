import React, { useEffect, useRef, useState } from "react";
import {
  PURCHASE_EVENT_TYPE,
  TRIGGERING_CONTEXT,
  VIEW_MESSAGE,
  VIEW_NAME,
  type ViewMessage,
} from "@rbx/payments/payments-flow-analytics";
import { sendUserPurchaseFlowEvent } from "../util/purchaseFlowUtil";
import { useTranslations } from "@rbx/www-common/i18n";
import links from "../constants/linkConstants";
import LeaveRobloxPopupDisclaimer from "../components/robux-popover/LeaveRobloxPopupDisclaimer";
import Link from "../components/NavLink";
import { getNavCapability } from "../util/navCapabilities";
import { useNavUser } from "../util/navUser";

export default function NavigationRobux() {
  const t = useTranslations("CommonUI.Features");
  const { buyRobuxUrl } = links;
  const { buyRobux, buyRobuxOnVng } = buyRobuxUrl;
  const user = useNavUser();
  const [isEligibleForVng, setIsEligibleForVng] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const cacheRef = useRef(new Map());

  const sendAnalyticsEvent = (viewMessage: ViewMessage) => {
    sendUserPurchaseFlowEvent({
      triggerContext: TRIGGERING_CONTEXT.WEB_ROBUX_PURCHASE,
      isMidPurchaseStep: false,
      viewName: VIEW_NAME.NAVIGATION_ROBUX_TEXT,
      purchaseEventType: PURCHASE_EVENT_TYPE.USER_INPUT,
      viewMessage,
    });
  };

  useEffect(() => {
    const cache = cacheRef.current;
    const { cacheKey } = buyRobuxOnVng;

    if (cache.has(cacheKey)) {
      setIsEligibleForVng(cache.get(cacheKey));
      return;
    }

    if (user == null || getNavCapability("getVngShopSignedRedirectionUrl") == null) {
      return;
    }

    getNavCapability("getNavigationHeaderBehavior")?.().then(guacMetadata => {
      setIsEligibleForVng(guacMetadata.shouldShowVng);
      cache.set(cacheKey, guacMetadata.shouldShowVng);
    });
  }, [buyRobuxOnVng, buyRobuxOnVng.cacheKey, user?.id]);

  const onBuyRobuxClick = () => {
    sendAnalyticsEvent(VIEW_MESSAGE.BUY_ROBUX);
  };

  const onBuyRobuxExternalClick = () => {
    sendAnalyticsEvent(VIEW_MESSAGE.EXTERNAL_LINK_MODAL);

    setIsPopupOpen(true);
  };

  const onBuyRobuxExternalCancel = () => {
    setIsPopupOpen(false);
  };

  const onBuyRobuxExternalContinue = () => {
    sendAnalyticsEvent(VIEW_MESSAGE.CONTINUE_TO_VNG);

    const getVngShopUrl =
      getNavCapability("getVngShopSignedRedirectionUrl") ??
      (() => Promise.resolve<{ vngShopRedirectUrl?: string }>({}));
    getVngShopUrl().then(
      ({ vngShopRedirectUrl }) => {
        window.open(vngShopRedirectUrl ?? buyRobuxOnVng.url, "_blank")?.focus();
      },
      () => {
        window.open(buyRobuxOnVng.url, "_blank")?.focus();
      },
    );

    setIsPopupOpen(false);
  };

  return (
    <div>
      {isEligibleForVng ? (
        <React.Fragment>
          <LeaveRobloxPopupDisclaimer
            isOpen={isPopupOpen}
            onClose={onBuyRobuxExternalCancel}
            onContinue={onBuyRobuxExternalContinue}
          />
          <Link
            cssClasses="font-header-2 nav-menu-title text-header robux-menu-btn"
            onClick={onBuyRobuxExternalClick}
          >
            {t(buyRobux.name)}
          </Link>
        </React.Fragment>
      ) : (
        <Link
          cssClasses="font-header-2 nav-menu-title text-header robux-menu-btn"
          url={buyRobux.url}
          onClick={onBuyRobuxClick}
        >
          {t(buyRobux.name)}
        </Link>
      )}
    </div>
  );
}
