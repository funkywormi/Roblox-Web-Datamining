import { QueryClientProvider } from "@tanstack/react-query";
import { render } from "react-dom";
import { getDeviceClient } from "@rbx/www-common/device/client";
import { window, document } from "@rbx/core-lib/browser";
import dataStores from "@rbx/core-scripts/data-store";
import { registerReferrerLookup } from "@rbx/subscriptions-common";
import { PaymentsTranslationProvider } from "@rbx/payments";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient } from "@rbx/core-scripts/react";
import { paymentFlowAnalyticsService as pfas } from "@rbx/payments/payments-flow-analytics";
import { useTranslations, type Namespace } from "@rbx/www-common/i18n";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { ToastProvider } from "@rbx/payments/components";
import { isPremiumUser } from "@rbx/core-scripts/meta/user";
import { translations } from "./component.json";
import { ROOT_ELEMENT_ID } from "./src/constants";
import { App } from "./src/App";
import "./src/main.css";
import "./src/stylesheets/robuxRedesign.scss";
import "./src/stylesheets/styleGuidePatch.scss";
import { reportPageLoad, reportPageView, ObsErrorBoundary } from "./src/observability";
import { reportInteractive } from "./src/utils/publishMetric";
import { getBuyRobuxPageDataFromDOM } from "./src/utils/getBuyRobuxPageDataFromDOM";
import { getEnhancedBuyRobuxPageData } from "./src/utils/getEnhancedBuyRobuxPageData";

registerReferrerLookup(referrerId => dataStores.userDataStore.getUser(referrerId));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const namespaces = translations as unknown as readonly Namespace[];

const ToastWrapper = ({ children }: { children: React.ReactNode }) => {
  const translate = useTranslations("CommonUI.Controls");
  return <ToastProvider closeLabel={translate("Action.Close")}>{children}</ToastProvider>;
};

const getUrlParams = () => {
  if (window === undefined) {
    return {};
  }

  const search = new URLSearchParams(window.location.search);
  return {
    ctx: search.get("ctx") ?? undefined,
    product_id: search.get("product_id") ?? undefined,
    showHeader: search.get("showHeader") ?? undefined,
  };
};

ready(() => {
  if (document === undefined) {
    return;
  }

  reportPageLoad();

  const isSubscriber = isPremiumUser();
  const urlParams = getUrlParams();

  const buyRobuxPageData = getBuyRobuxPageDataFromDOM();
  if (!buyRobuxPageData) {
    return;
  }

  const enhancedBuyRobuxPageData = getEnhancedBuyRobuxPageData({
    buyRobuxPageData,
    isSubscriber,
    urlProductId: urlParams.product_id,
  });

  reportInteractive();
  reportPageView();

  // Set the payment flow UUID before React mounts so no child effect fires
  // a tracking event with a stale/random UUID (race condition fix).
  // Skipped for unauth — there's no purchase flow until the user signs in.
  if (buyRobuxPageData.purchaseFlowId) {
    pfas.setPaymentFlowUuid(buyRobuxPageData.purchaseFlowId);
  }

  render(
    <ObsErrorBoundary name="BuyRobuxPageReactCrash">
      <QueryClientProvider client={queryClient}>
        <TranslationProviderSCC namespaces={namespaces}>
          <PaymentsTranslationProvider config={translations} context="RobuxRedesign">
            <ToastWrapper>
              <App
                enhancedBuyRobuxPageData={enhancedBuyRobuxPageData}
                urlParams={urlParams}
                deviceMeta={getDeviceClient()}
              />
            </ToastWrapper>
          </PaymentsTranslationProvider>
        </TranslationProviderSCC>
      </QueryClientProvider>
    </ObsErrorBoundary>,
    document.getElementById(ROOT_ELEMENT_ID),
  );
});
