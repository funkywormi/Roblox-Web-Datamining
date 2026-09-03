import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { Browser, currentBrowser } from "@rbx/core-scripts/util/current-browser";
import { addExternal } from "@rbx/externals";
import { ageBadgeControl } from "./src/util/ageBadgeUtil";
import { logKidsThemeExposureIfEnabled } from "./src/util/kidsThemeIxpUtil";
import LeftNavigation from "./src/leftNav";
import NavigationRightHeader from "./src/containers/NavigationRightHeader";
import NavigationRobux from "./src/containers/NavigationRobux";
import { cacheUserId } from "./src/util/authUtil";
import PasskeyUpgradeSnackbar from "./src/components/PasskeyUpgradeSnackbar";
import PostSignupDownloadModalRoot, {
  newUserSessionStorageKey,
  newUserSessionStorageValue,
} from "./src/components/PostSignupDownloadModal";
import { initializeDevelopLink } from "./src/util/developUtil";
import { initNavClickEvents } from "./src/util/navClickUtil";
import MenuIcon from "./src/containers/MenuIcon";
import AgeBadge from "./src/components/AgeBadge";
import setupAuthInterceptor from "./src/services/authInterceptor";
import { attemptPasskeyUpgrade } from "./src/util/conditionalPasskeyCreate";
import * as navigation from "./src";
import { translations } from "./component.json";

import "./src/main.css";
import "./src/css/navigation.scss";

const rightNavigationHeaderContainerId = "right-navigation-header";
const leftNavigationContainerId = "left-navigation-container";
const menuIconContainerId = "header-menu-icon";
const navigationRobuxContainerId = "navigation-robux-container";
const navigationRobuxMobileContainerId = "navigation-robux-mobile-container";
const ageBadgeContainerId = "age-badge-container";

addExternal(["Roblox", "NavigationService"], navigation);
cacheUserId();
initializeDevelopLink();
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
      <TranslationProvider config={translations}>
        <MenuIcon />
      </TranslationProvider>,
      document.getElementById(menuIconContainerId),
    );
  }

  const ageBadgeVariant = ageBadgeControl();
  if (ageBadgeVariant && document.getElementById(ageBadgeContainerId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <AgeBadge variant={ageBadgeVariant} />
      </TranslationProvider>,
      document.getElementById(ageBadgeContainerId),
    );

    document
      .getElementById(ageBadgeContainerId)
      ?.closest(".rbx-navbar-header")
      ?.classList.add("has-age-badge");
  }

  logKidsThemeExposureIfEnabled();

  if (document.getElementById(navigationRobuxContainerId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <NavigationRobux />
      </TranslationProvider>,
      document.getElementById(navigationRobuxContainerId),
    );
  }

  if (document.getElementById(navigationRobuxMobileContainerId)) {
    renderWithErrorBoundary(
      <TranslationProvider config={translations}>
        <NavigationRobux />
      </TranslationProvider>,
      document.getElementById(navigationRobuxMobileContainerId),
    );
  }

  if (document.getElementById(rightNavigationHeaderContainerId)) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <NavigationRightHeader />
        </TranslationProvider>
      </QueryClientProvider>,
      document.getElementById(rightNavigationHeaderContainerId),
    );
  }

  if (currentBrowser() === Browser.Safari) {
    // eslint-disable-next-line no-void
    void upgradeResult.then(success => {
      if (success) {
        const snackbarContainer = document.createElement("div");
        document.body.appendChild(snackbarContainer);
        renderWithErrorBoundary(
          <TranslationProvider config={translations}>
            <PasskeyUpgradeSnackbar />
          </TranslationProvider>,
          snackbarContainer,
        );
      }
    });
  }

  if (document.getElementById(leftNavigationContainerId)) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <LeftNavigation />
        </TranslationProvider>
      </QueryClientProvider>,
      document.getElementById(leftNavigationContainerId),
    );
  }

  if (window.sessionStorage.getItem(newUserSessionStorageKey) === newUserSessionStorageValue) {
    const downloadModalContainer = document.createElement("div");
    document.body.appendChild(downloadModalContainer);
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <PostSignupDownloadModalRoot />
        </TranslationProvider>
      </QueryClientProvider>,
      downloadModalContainer,
    );
  }
});
