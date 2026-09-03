import ready from "@rbx/core-scripts/util/ready";
import { queryClient, renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { EventContext } from "@rbx/unified-logging";
import { FriendsCarousel, FriendCarouselNames } from "@rbx/friends-common";
import { getUrlUserId } from "@rbx/friends-common/utils";
import { translations } from "./component.json";
import "./src/main.css";
import "./src/main.scss";

const userDataMetaTag = document.querySelector('meta[name="user-data"]');
const rawAuthenticatedUserId = parseInt(userDataMetaTag?.getAttribute("data-userid") ?? "", 10);
const authenticatedUserId = Number.isNaN(rawAuthenticatedUserId) ? null : rawAuthenticatedUserId;
const profileNumberString = getUrlUserId();
const rawProfileUserId = parseInt(profileNumberString ?? "", 10);
const profileUserId = Number.isNaN(rawProfileUserId) ? null : rawProfileUserId;

ready(() => {
  const container = document.getElementById("friends-carousel-container");
  if (!container) {
    return;
  }
  renderWithErrorBoundary(
    <QueryClientProvider client={queryClient}>
      <TranslationProvider config={translations}>
        <FriendsCarousel
          // TODO: what to do on invalid id/url?
          profileUserId={profileUserId ?? 0}
          isOwnUser={profileUserId === authenticatedUserId}
          carouselName={FriendCarouselNames.WebProfileFriendsCarousel}
          eventContext={EventContext.UserProfile}
          homePageSessionInfo={undefined}
          sortId={undefined}
          sortPosition={undefined}
        />
      </TranslationProvider>
    </QueryClientProvider>,
    container,
  );
});
