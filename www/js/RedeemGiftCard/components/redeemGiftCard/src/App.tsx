import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { withTranslations, WithTranslationsProps } from "react-utilities";
import { queryClient } from "@rbx/core-scripts/react";
import { trackCounter, redeemFunnelMetadata } from "@rbx/payments/creditCheckout";
import paymentFlowAnalyticsService from "@rbx/core-scripts/payments-flow";
import { translationConfig } from "./app.config";
import RedeemGiftCard from "./components/redeemGiftCardWrapper";

type AppProps = WithTranslationsProps;

const App = ({ translate, intl }: AppProps) => {
  useEffect(() => {
    trackCounter("Page_Viewed");
    paymentFlowAnalyticsService.sendUserPurchaseFlowEvent(
      paymentFlowAnalyticsService.ENUM_TRIGGERING_CONTEXT.WEB_REDEEM_PAGE,
      true,
      paymentFlowAnalyticsService.ENUM_VIEW_NAME.REDEEM_ROBLOX_CARD_PAGE,
      paymentFlowAnalyticsService.ENUM_PURCHASE_EVENT_TYPE.VIEW_SHOWN,
      undefined,
      redeemFunnelMetadata({}),
    );
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RedeemGiftCard translate={translate} intl={intl} />
    </QueryClientProvider>
  );
};

App.propTypes = {
  translate: PropTypes.func.isRequired,
  intl: PropTypes.shape({ getRobloxLocale: PropTypes.func.isRequired }).isRequired,
};

export default withTranslations(App as React.FC<WithTranslationsProps>, translationConfig);
