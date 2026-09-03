import { QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { renderWithErrorBoundary, TranslationProvider, queryClient } from "@rbx/core-scripts/react";
import { ServerList } from "@rbx/discovery-common";
import { RobloxSubscriptionSheet } from "@rbx/subscriptions-common";
import { translations } from "./component.json";
import "./src/serverList.scss";
import "./src/main.css";

ready(() => {
  const runningGamesContainer = document.getElementById("running-game-instances-container");
  const serversSectionContainer = document.getElementById("server-list-web-app");
  if (runningGamesContainer) {
    // Web EDP page Servers section entry (/games/{placeId})
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          <ServerList sheetComponent={RobloxSubscriptionSheet} />
        </TranslationProvider>
      </QueryClientProvider>,
      runningGamesContainer,
    );
  } else if (serversSectionContainer) {
    // WebAppPage for /servers-section and /servers-section-preopen-create-vip
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <TranslationProvider config={translations}>
          {/* Containers with ID are added to match the legacy CSS from the  */}
          <div id="all-servers-lists">
            <div id="running-game-instances-container">
              <ServerList sheetComponent={RobloxSubscriptionSheet} />
            </div>
          </div>
        </TranslationProvider>
      </QueryClientProvider>,
      serversSectionContainer,
    );
  } else {
    window.EventTracker.fireEvent("ServerListEntryNoDomNodeFound");
  }
});
