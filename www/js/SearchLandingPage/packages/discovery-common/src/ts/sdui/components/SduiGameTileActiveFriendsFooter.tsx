import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThumbnailAvatarHeadshotSize, ThumbnailTypes, ThumbnailFormat } from "@rbx/thumbnails";
import { GameTileActiveFriendsFacepile } from "@rbx/discovery-sdui-components";
import {
  SduiActionType,
  TSduiActionConfig,
  TSduiParsedAction,
} from "../system/SduiActionParserRegistry";
import { TSduiCommonProps, TSduiContext, TSduiFriendPresenceData } from "../system/SduiTypes";
import SduiTileFooter from "./SduiTileFooter";
import SduiThumbnailImage from "./SduiThumbnailImage";
import { SduiRegisteredComponents } from "../system/SduiComponentRegistry";
import { TGetPlaceDetails } from "../../common/types/bedev1Types";
import { ShimmedPlayerInteractionModal } from "../../common/components/GameTileUtils";
import bedev1Services from "../../common/services/bedev1Services";
import { parseCallback } from "../system/SduiParsers";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

type TShimmedPlayerInteractionModalSduiWrapper = {
  friendsInGame: TSduiFriendPresenceData[];
  onHide: (e: Event) => void;
  placeId: number;
  sduiContext: TSduiContext;
};

export const ShimmedPlayerInteractionModalSduiWrapper = ({
  friendsInGame,
  onHide,
  placeId,
  sduiContext,
}: TShimmedPlayerInteractionModalSduiWrapper): JSX.Element => {
  const [placeDetails, setPlaceDetails] = useState<TGetPlaceDetails | undefined>(undefined);

  useEffect(() => {
    bedev1Services
      .getPlaceDetails(placeId.toString())
      .then(data => {
        setPlaceDetails(data);
      })
      .catch(error => {
        setPlaceDetails(undefined);

        logSduiError(
          SduiErrorNames.ActiveFriendsFooterPlaceDetailsFetchError,
          `Error fetching place details for active friends footer with placeId ${placeId}, error message is: ${JSON.stringify(
            error,
          )}`,
          sduiContext.pageContext,
        );
      });
  }, [placeId, sduiContext.pageContext]);

  const friendsDataInGame = useMemo(() => {
    return friendsInGame.map(friend => ({
      id: friend.userId,
      displayName: friend.displayName,
      presence: friend.presence,
    }));
  }, [friendsInGame]);

  if (!placeDetails) {
    return <React.Fragment />;
  }

  return (
    <ShimmedPlayerInteractionModal
      friendsDataInGame={friendsDataInGame}
      show
      onHide={onHide}
      game={placeDetails}
    />
  );
};

type TSduiGameTileActiveFriendsFooterProps = {
  universeId: string;

  maxAvatars?: number;
  iconWidth?: number;

  onActivated?: TSduiParsedAction;
} & TSduiCommonProps;

const SduiGameTileActiveFriendsFooter = ({
  sduiContext,
  analyticsContext,

  universeId,
  maxAvatars,
  iconWidth,

  onActivated,
}: TSduiGameTileActiveFriendsFooterProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  const derivedMaxAvatars = maxAvatars ?? 3;
  const derivedIconWidth = iconWidth ?? tokens.Size.Size_400;

  const friendsInGame = useMemo(() => {
    const friends = sduiContext.dataStore.social.inGameFriendsByUniverseId[universeId] ?? [];

    return friends.slice(0, derivedMaxAvatars);
  }, [sduiContext.dataStore.social.inGameFriendsByUniverseId, universeId, derivedMaxAvatars]);

  const footerText = useMemo(() => {
    return friendsInGame.map(friend => friend.displayName).join(", ");
  }, [friendsInGame]);

  const [isModalShown, setIsModalShown] = useState(false);

  const placeId = friendsInGame[0]?.presence?.placeId;

  const reportActionAnalytics = useCallback(() => {
    const actionConfig: TSduiActionConfig = {
      actionType: SduiActionType.OpenJoinFriends,
      actionParams: {
        placeId,
        universeId,
      },
    };

    const parsedAction = parseCallback(actionConfig, analyticsContext, sduiContext);

    parsedAction.onActivated();
  }, [placeId, universeId, analyticsContext, sduiContext]);

  const derivedOnActivated: TSduiParsedAction | undefined = useMemo(() => {
    if (onActivated) {
      return onActivated;
    }

    if (!placeId) {
      return undefined;
    }

    return {
      onActivated: () => {
        // CLIGROW-2601: Differs from App implementation of this action because we can't render a
        // modal directly through the SDUI Action today. We can integrate a modal service to SDUI
        // context for parity.
        setIsModalShown(true);

        reportActionAnalytics();
      },
    };
  }, [onActivated, placeId, reportActionAnalytics]);

  const onHideModal = useCallback((e: Event) => {
    e.stopPropagation();
    e.preventDefault();

    setIsModalShown(false);
  }, []);

  const facepileComponent = useMemo(() => {
    const avatarThumbnails = friendsInGame.map(friend => (
      <SduiThumbnailImage
        key={friend.userId}
        thumbnailType={ThumbnailTypes.avatarHeadshot}
        targetId={friend.userId.toString()}
        format={ThumbnailFormat.webp}
        size={ThumbnailAvatarHeadshotSize.size48}
      />
    ));

    return (
      <GameTileActiveFriendsFacepile
        avatarThumbnails={avatarThumbnails}
        iconWidth={derivedIconWidth}
        avatarContainerBackgroundColor={tokens.Color.Surface.Surface_200}
        avatarImageBackgroundColor={tokens.Color.Extended.Gray.Gray_800}
        avatarBorderColor={tokens.Color.System.Success}
      />
    );
  }, [friendsInGame, derivedIconWidth, tokens]);

  return (
    <React.Fragment>
      <SduiTileFooter
        componentConfig={{
          componentType: SduiRegisteredComponents.TileFooter,
          props: {},
        }}
        sduiContext={sduiContext}
        analyticsContext={analyticsContext}
        leftIconComponent={facepileComponent}
        leftText={footerText}
        textIconGap={tokens.Gap.Small}
        onActivated={derivedOnActivated}
      />
      {placeId && isModalShown && (
        <ShimmedPlayerInteractionModalSduiWrapper
          friendsInGame={friendsInGame}
          onHide={onHideModal}
          placeId={placeId}
          sduiContext={sduiContext}
        />
      )}
    </React.Fragment>
  );
};

export default SduiGameTileActiveFriendsFooter;
