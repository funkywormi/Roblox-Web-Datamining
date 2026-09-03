import React, { Fragment, useCallback, useMemo } from "react";
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from "@rbx/thumbnails";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import { Component } from "@rbx/profile-platform";
import { PageContext } from "@rbx/discovery-common";
import { useExperiments } from "@rbx/profile-common/ExperimentsContext";
import { ExperimentKey } from "@rbx/profile-common/experimentationUtils";
import { useProfilePlatformContext } from "../context/ProfilePlatformContext";
import { useGamesByUniverseIds } from "../services/gamesService";
import useProfileJsonComponent from "../hooks/useProfileJsonComponent";

const CurrentlyPlayingCard: React.FC = () => {
  const { profileId, profileType } = useProfilePlatformContext();
  const { isInTreatment } = useExperiments();

  const isClickableEnabled = isInTreatment(ExperimentKey.IsCurrentlyPlayingCardClickableEnabled);

  const currentlyPlaying = useProfileJsonComponent(Component.CurrentlyPlaying);
  const universeId = currentlyPlaying?.universeId ?? null;

  const universeIds = useMemo(() => (universeId !== null ? [universeId] : []), [universeId]);
  const { data: games } = useGamesByUniverseIds(universeIds);
  const game = games?.[0];
  const rootPlaceId = game?.rootPlaceId ?? null;

  const ageRecommendationLabel =
    currentlyPlaying?.ageRecommendation?.ageRecommendationSummary?.ageRecommendation
      ?.displayNameWithHeaderShort;

  const edpUrl = useMemo(() => {
    if (!rootPlaceId || !universeId) return null;
    const referralParams = new URLSearchParams({
      placeId: String(rootPlaceId),
      universeId: String(universeId),
      position: "1",
      page: PageContext.UserProfilePage,
      friendId: profileId,
    });
    return `/games/${rootPlaceId}?${referralParams.toString()}`;
  }, [rootPlaceId, universeId, profileId]);

  const handleClick = useCallback(() => {
    sendEventWithTarget(
      "buttonClick",
      "profilePlatform",
      {
        profile_id: profileId,
        profile_type: profileType,
        btn: "CurrentlyPlayingCard",
        universe_id: universeId ?? undefined,
        place_id: rootPlaceId ?? undefined,
      },
      targetTypes.WWW,
    );
  }, [profileId, profileType, universeId, rootPlaceId]);

  if (!universeId || !game) {
    return null;
  }

  const cardClassName =
    "currently-playing-card flex items-center gap-small padding-y-small padding-x-medium radius-medium bg-shift-100 stroke-standard stroke-default";

  const cardContents = (
    <Fragment>
      <Thumbnail2d
        targetId={universeId}
        type={ThumbnailTypes.gameIcon}
        size={ThumbnailGameIconSize.size150}
        containerClass="currently-playing-card-thumbnail width-[48px] height-[48px] shrink-0 radius-small overflow-hidden"
        altName={game.name}
      />
      <div className="flex flex-col min-width-0">
        <span className="text-title-medium content-emphasis text-truncate-end text-no-wrap max-width-[200px]">
          {game.name}
        </span>
        {ageRecommendationLabel && (
          <span className="text-body-medium content-default text-truncate-end text-no-wrap max-width-[200px]">
            {ageRecommendationLabel}
          </span>
        )}
      </div>
    </Fragment>
  );

  if (isClickableEnabled && edpUrl) {
    return (
      <a
        href={edpUrl}
        className={`${cardClassName} cursor-pointer transition-colors hover:bg-surface-300`}
        style={{ color: "inherit", textDecoration: "none" }}
        onClick={handleClick}
      >
        {cardContents}
      </a>
    );
  }

  return <div className={cardClassName}>{cardContents}</div>;
};

export default CurrentlyPlayingCard;
