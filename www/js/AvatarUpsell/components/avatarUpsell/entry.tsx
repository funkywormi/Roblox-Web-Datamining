import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { renderWithErrorBoundary } from "@rbx/core-scripts/react";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import type { Namespace } from "@rbx/www-common/i18n";
import AvatarUpsellApp from "./src/AvatarUpsellApp";
import { translations as rawTranslations } from "./component.json";
import "./src/main.css";

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- CI narrows Namespace; component.json is always valid
const translations = rawTranslations as unknown as readonly Namespace[];

const queryClient = new QueryClient();

const isEligibleForUpsell = () => {
  const deviceInfo = getDeviceMeta();
  return (
    deviceInfo != null &&
    (deviceInfo.isPhone || deviceInfo.isTablet) &&
    (deviceInfo.isAndroidDevice || deviceInfo.isIosDevice)
  );
};

ready(() => {
  if (!isEligibleForUpsell()) {
    return;
  }

  const container =
    document.getElementById("upsell-container") ?? document.getElementById("avatar-web-app");
  if (container == null) {
    return;
  }

  container.classList.add("upsell-container", "rbx-is-upsell");
  container.setAttribute("avatar-upsell-base", "");
  document.body.classList.add("avatar-upsell");

  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProviderSCC namespaces={translations}>
        <AvatarUpsellApp />
      </TranslationProviderSCC>
    </QueryClientProvider>,
    container,
  );
});
