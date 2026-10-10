import { unmountComponentAtNode } from "react-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import dataStores from "@rbx/core-scripts/data-store";
import { registerReferrerLookup } from "@rbx/subscriptions-common";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { Browser, currentBrowser } from "@rbx/core-scripts/util/current-browser";
import { addExternal } from "@rbx/externals";
import { TranslationProviderSCC } from "@rbx/www-common/i18n/scc";
import { ageBadgeControl } from "./src/util/ageBadgeUtil";
import LeftNavigation from "./src/leftNav";
import NavigationRightHeader from "./src/containers/NavigationRightHeader";
import NavigationRobux from "./src/containers/NavigationRobux";
import { cacheUserId } from "./src/util/authUtil";
import PasskeyUpgradeSnackbar from "./src/components/PasskeyUpgradeSnackbar";
import PostSignupDownloadModal from "./src/components/PostSignupDownloadModal";
import { initializeDevelopLink } from "./src/util/developUtil";
import { initializeLogoLink } from "./src/util/logoUtil";
import { initNavClickEvents } from "./src/util/navClickUtil";
import MenuIcon from "./src/containers/MenuIcon";
import AgeBadge from "./src/components/AgeBadge";
import { TopNavErrorBoundary } from "./src/topNav/observability";
import setupAuthInterceptor from "./src/services/authInterceptor";
import { attemptPasskeyUpgrade } from "./src/util/conditionalPasskeyCreate";
import * as navigation from "./src";
import { translations } from "./component.json";
import { navNamespaces } from "./src/constants/translationNamespaces";

import "./src/main.css";
import "./src/css/_header.css";
import "./src/css/_leftnav.css";
import "./src/css/_themes.css";
import "./src/css/_searchLanding.css";
import "./src/css/_downloadAppNavItem.css";

registerReferrerLookup(referrerId => dataStores.userDataStore.getUser(referrerId));

const rightNavigationHeaderContainerId = "right-navigation-header";
const leftNavigationContainerId = "left-navigation-container";
const menuIconContainerId = "header-menu-icon";
const navigationRobuxContainerId = "navigation-robux-container";
const navigationRobuxMobileContainerId = "navigation-robux-mobile-container";
const ageBadgeContainerId = "age-badge-container";

addExternal(["Roblox", "NavigationService"], navigation);
cacheUserId();
initializeDevelopLink();
initializeLogoLink();
initNavClickEvents();

// Setup HTTP interceptor to listen for 401 auth codes
setupAuthInterceptor();

// The anchor html elements lives in navigation.html
// Mounting components seperatly to avoid hydrating
// components that do not need to be server rendered.
ready(() => {
  const upgradeResult = attemptPasskeyUpgrade();

  if (document.getElementById(menuIconContainerId)) {
    renderWithErrorBoundary(
      <TopNavErrorBoundary name="MenuIconCrash">
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <MenuIcon />
          </TranslationProvider>
        </TranslationProviderSCC>
      </TopNavErrorBoundary>,
      document.getElementById(menuIconContainerId),
    );
  }

  const ageBadgeVariant = ageBadgeControl();
  if (ageBadgeVariant && document.getElementById(ageBadgeContainerId)) {
    renderWithErrorBoundary(
      <TopNavErrorBoundary name="AgeBadgeCrash">
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <AgeBadge variant={ageBadgeVariant} />
          </TranslationProvider>
        </TranslationProviderSCC>
      </TopNavErrorBoundary>,
      document.getElementById(ageBadgeContainerId),
    );

    document
      .getElementById(ageBadgeContainerId)
      ?.closest(".rbx-navbar-header")
      ?.classList.add("has-age-badge");
  }

  if (document.getElementById(navigationRobuxContainerId)) {
    renderWithErrorBoundary(
      <TopNavErrorBoundary name="RobuxCrash">
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <NavigationRobux />
          </TranslationProvider>
        </TranslationProviderSCC>
      </TopNavErrorBoundary>,
      document.getElementById(navigationRobuxContainerId),
    );
  }

  if (document.getElementById(navigationRobuxMobileContainerId)) {
    renderWithErrorBoundary(
      <TopNavErrorBoundary name="RobuxCrash">
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <NavigationRobux />
          </TranslationProvider>
        </TranslationProviderSCC>
      </TopNavErrorBoundary>,
      document.getElementById(navigationRobuxMobileContainerId),
    );
  }

  if (document.getElementById(rightNavigationHeaderContainerId)) {
    renderWithErrorBoundary(
      <TopNavErrorBoundary name="RightHeaderCrash">
        <QueryClientProvider client={queryClient}>
          <TranslationProviderSCC namespaces={navNamespaces}>
            <TranslationProvider config={translations}>
              <NavigationRightHeader />
            </TranslationProvider>
          </TranslationProviderSCC>
        </QueryClientProvider>
      </TopNavErrorBoundary>,
      document.getElementById(rightNavigationHeaderContainerId),
    );
  }

  if (currentBrowser() === Browser.Safari) {
    // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation
    void upgradeResult.then(success => {
      if (success) {
        const snackbarContainer = document.createElement("div");
        document.body.appendChild(snackbarContainer);
        renderWithErrorBoundary(
          <TranslationProviderSCC namespaces={navNamespaces}>
            <TranslationProvider config={translations}>
              <PasskeyUpgradeSnackbar />
            </TranslationProvider>
          </TranslationProviderSCC>,
          snackbarContainer,
        );
      }
    });
  }

  if (document.getElementById(leftNavigationContainerId)) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <LeftNavigation />
          </TranslationProvider>
        </TranslationProviderSCC>
      </QueryClientProvider>,
      document.getElementById(leftNavigationContainerId),
    );
  }

  const takeNewUserFlag = () => {
    try {
      const flag = window.sessionStorage.getItem("new-user");
      if (flag != null) {
        try {
          window.sessionStorage.removeItem("new-user");
        } catch {
          // do nothing
        }
      }
      return flag === "true";
    } catch {
      return false;
    }
  };

  if (takeNewUserFlag()) {
    const downloadModalContainer = document.createElement("div");
    document.body.appendChild(downloadModalContainer);
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProviderSCC namespaces={navNamespaces}>
          <TranslationProvider config={translations}>
            <PostSignupDownloadModal
              unmount={() => unmountComponentAtNode(downloadModalContainer)}
            />
          </TranslationProvider>
        </TranslationProviderSCC>
      </QueryClientProvider>,
      downloadModalContainer,
    );
  }
});
