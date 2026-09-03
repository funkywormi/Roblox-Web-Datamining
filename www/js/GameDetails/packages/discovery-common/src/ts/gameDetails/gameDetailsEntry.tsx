import { QueryClientProvider } from "@tanstack/react-query";
import { ShareLinks } from "@rbx/core-scripts/deep-link";
import { renderWithErrorBoundary, queryClient } from "@rbx/core-scripts/react";
import { gameDetailsPage } from "../common/constants/configConstants";
import InviteLinkInvalidModal from "./components/InviteLinkInvalidModal";
import CarouselContainer from "./containers/CarouselContainer";
import PlayButton from "./containers/PlayButton";
import AboutTab from "./containers/AboutTab";
import metadataConstants from "./constants/metadataConstants";
import carouselConstants from "./constants/carouselConstants";
import playButtonConstants from "./constants/playButtonConstants";
import aboutTabConstants from "./constants/aboutTabConstants";
import edpUpsellConstants from "./constants/edpUpsellConstants";
import EdpUpsellCardContainer from "./containers/EdpUpsellCardContainer";
import inviteLinkInvalidModalConstants from "./constants/inviteLinkInvalidModalConstants";
import unavailableConstants from "./constants/unavailableConstants";
import UnavailableExperience from "./containers/UnavailableExperience";
// @ts-expect-error TODO: old, migrated code.
import VotingPanelService from "./containers/VotingPanelService";
import "../../css/gameDetails/gameDetails.scss";
import sessionReferralUtils from "../common/utils/sessionReferralUtils";
import { AttributionType, getAttributionId } from "../common/utils/attributionUtils";
import { ReviewCategoryType } from "./services/playerFeedbackService";
import playerFeedbackConstants from "./constants/playerFeedbackConstants";
import PlayerFeedbackContainer from "./components/PlayerFeedbackContainer";
import instrumentCreatorByline from "./utils/instrumentCreatorByline";

export default (): void => {
  // Don't show the rest of the details page if the experience is unavailable
  if (unavailableConstants.gameDetailsUnavailableContainer()) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <UnavailableExperience />
      </QueryClientProvider>,
      unavailableConstants.gameDetailsUnavailableContainer(),
    );
    return;
  }

  // EDP creator-byline telemetry (GRPS-3058/3059): instrument the byline after the availability guard.
  instrumentCreatorByline();

  const { referralSessionInfo, referralPage } = sessionReferralUtils.extractReferralInfo();
  const attributionId = getAttributionId(AttributionType.GameDetailReferral);

  function toggleShowBanner(targetValue: boolean, voteType?: ReviewCategoryType) {
    if (playerFeedbackConstants.gameDetailsPlayerFeedbackBannerContainer()) {
      const { placeId = "", universeId = "" } = metadataConstants.metadataData();
      // The below render step is called each time the user successfully up/downvotes. It would be
      // preferred to use React hooks instead, but the Voting Panel is not a React component and
      // cannot use hooks.
      try {
        renderWithErrorBoundary(
          <PlayerFeedbackContainer
            voteType={voteType}
            show={targetValue}
            placeId={placeId}
            universeId={universeId}
          />,
          playerFeedbackConstants.gameDetailsPlayerFeedbackBannerContainer(),
        );
      } catch {
        // Failing to render the banner is OK
      }
    }
  }

  if (carouselConstants.gameDetailsCarouselContainer()) {
    const { placeName = "", universeId = "", placeId = "" } = metadataConstants.metadataData();
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <CarouselContainer
          placeName={placeName}
          universeId={universeId}
          placeId={placeId}
          delay={carouselConstants.carouselConfigs.delay}
        />
      </QueryClientProvider>,
      carouselConstants.gameDetailsCarouselContainer(),
    );
  }

  if (playButtonConstants.gameDetailsPlayButtonContainer()) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <PlayButton attributionId={attributionId} />
      </QueryClientProvider>,
      playButtonConstants.gameDetailsPlayButtonContainer(),
    );
  }

  if (aboutTabConstants.gameDetailsAboutTabContainer()) {
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <AboutTab
          attributionId={attributionId}
          referralSessionInfo={referralSessionInfo}
          referralPage={referralPage}
        />
      </QueryClientProvider>,
      aboutTabConstants.gameDetailsAboutTabContainer(),
    );
  }

  if (edpUpsellConstants.gameDetailsEdpUpsellContainer()) {
    const { universeId = "" } = metadataConstants.metadataData();
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <EdpUpsellCardContainer universeId={universeId} />
      </QueryClientProvider>,
      edpUpsellConstants.gameDetailsEdpUpsellContainer(),
    );
  }

  // Use VotingPanel.js from web-frontend instead of WWW
  // Intermediate state of the Voting Panel Migration to web-frontend
  const votingPanelContainer = document.getElementById("voting-panel-container");
  if (votingPanelContainer) {
    const { rootPlaceId = "" } = metadataConstants.metadataData();

    try {
      VotingPanelService.checkPolicyAndLoad(
        "#voting-panel-container",
        rootPlaceId,
        (show: boolean, voteType?: ReviewCategoryType) => {
          toggleShowBanner(show, voteType);
        },
      );
    } catch {
      window.EventTracker?.fireEvent(gameDetailsPage.votingPanelLoadFailure);
    }
  }

  const { experienceInviteLinkId = "", experienceInviteStatus = "" } =
    metadataConstants.metadataData();
  if (
    experienceInviteLinkId &&
    (experienceInviteStatus === ShareLinks.ExperienceInviteStatus.INVITER_NOT_IN_EXPERIENCE ||
      experienceInviteStatus === ShareLinks.ExperienceInviteStatus.EXPIRED) &&
    inviteLinkInvalidModalConstants.gameDetailsInviteLinkInvalidModalContainer()
  ) {
    const { universeId = "", placeId = "" } = metadataConstants.metadataData();
    renderWithErrorBoundary(
      <QueryClientProvider client={queryClient}>
        <InviteLinkInvalidModal
          linkId={experienceInviteLinkId}
          linkStatus={experienceInviteStatus}
          placeId={placeId}
          universeId={universeId}
        />
      </QueryClientProvider>,
      inviteLinkInvalidModalConstants.gameDetailsInviteLinkInvalidModalContainer(),
    );
  }
};
