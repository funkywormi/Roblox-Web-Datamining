import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ready from "@rbx/core-scripts/util/ready";
import { isValueOf } from "@rbx/core-types";
import { renderWithErrorBoundary, TranslationProvider } from "@rbx/core-scripts/react";
import { SystemFeedbackProvider } from "@rbx/core-ui";
import { ProfileType } from "@rbx/profile-platform";
import { ExperimentsProvider } from "@rbx/profile-common/ExperimentsContext";
import { ExperimentationLayer } from "@rbx/profile-common/experimentationUtils";
import { translations } from "./component.json";
import ProfilePlatformContainer from "./src/ProfilePlatformContainer";
import { ProfilePlatformContextProvider } from "./src/context/ProfilePlatformContext";
import "./src/profilePlatform.scss";
import "./src/main.css";

const ONE_MIN_MS = 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: ONE_MIN_MS,
    },
  },
});

ready(() => {
  const profilePlatformContainer = document.querySelector(".profile-platform-container");
  const profileId = profilePlatformContainer?.getAttribute("data-profile-id") ?? "0";
  const profileType = profilePlatformContainer?.getAttribute("data-profile-type") ?? "";

  if (isValueOf(ProfileType, profileType)) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <SystemFeedbackProvider>
          <ExperimentsProvider layer={ExperimentationLayer.SocialProfile}>
            <ProfilePlatformContextProvider profileId={profileId} profileType={profileType}>
              <TranslationProvider config={translations}>
                <ProfilePlatformContainer />
              </TranslationProvider>
            </ProfilePlatformContextProvider>
          </ExperimentsProvider>
        </SystemFeedbackProvider>
      </QueryClientProvider>,
      profilePlatformContainer,
    );

    // Temporary fix to remove IDs from old profile tabs so that navigating to tabs
    // via hrefs don't cause scrolling issues. This can be removed once old
    // `profile-container` code is cleaned up.
    document.querySelector("#about")?.removeAttribute("id");
    document.querySelector("#creations")?.removeAttribute("id");
  }
});
