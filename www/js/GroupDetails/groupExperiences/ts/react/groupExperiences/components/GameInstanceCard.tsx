import React, { Fragment } from 'react';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { useTranslation } from 'react-utilities';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';
import { getCommonParams } from '../../shared/utils/pageInfo';
import { GameInstance, Player } from '../types';
import { joinPublicServer } from '../utils/joinPublicServer';

type GameInstanceCardProps = {
  groupId: number;
  experienceId: number;
  placeId: number;
  server: GameInstance;
};

const visiblePlayerCount = 5;

const getUserProfileUrl = (userId: number): string => {
  return `/users/${userId}/profile`;
};

const getCommonEventParams = (
  fallbackGroupId: number
): { groupId: number; locationTab: string; pageRoute: string } => {
  const { groupId, locationTab, pageRoute } = getCommonParams(
    window.location.hash,
    window.location.pathname
  );

  return {
    groupId: groupId || fallbackGroupId,
    locationTab,
    pageRoute
  };
};

function ServerSizeGauge({
  maxPlayerCount,
  currentPlayerCount
}: {
  maxPlayerCount: number;
  currentPlayerCount: number;
}): JSX.Element {
  if (!maxPlayerCount) return <Fragment />;
  const percent = Math.round((currentPlayerCount / maxPlayerCount) * 100);

  return (
    <div className='server-player-count-gauge border'>
      <div className='gauge-inner-bar border' style={{ width: `${percent}%` }} />
    </div>
  );
}

function PlayerThumbnailContainer({ player }: { player: Player }): JSX.Element {
  return (
    <span key={player.playerToken} className='avatar avatar-headshot-md player-avatar'>
      {player.id == null ? (
        <Thumbnail2d
          type={ThumbnailTypes.avatarHeadshot}
          targetId={player.playerToken}
          token={player.playerToken}
          containerClass='avatar-card-image'
        />
      ) : (
        <a className='avatar-card-link' href={getUserProfileUrl(player.id)}>
          <Thumbnail2d
            type={ThumbnailTypes.avatarHeadshot}
            targetId={player.id}
            containerClass='avatar-card-image'
            altName={player.displayName ?? undefined}
          />
        </a>
      )}
    </span>
  );
}

const GameInstanceCard = ({
  groupId,
  experienceId,
  placeId,
  server
}: GameInstanceCardProps): JSX.Element => {
  const { translate } = useTranslation();
  const players = server.players ?? [];
  const currentPlayersCount = server.playing || players.length;
  const truncatedPlayers =
    visiblePlayerCount && visiblePlayerCount > 0 ? players.slice(0, visiblePlayerCount) : players;
  const remainingPlayersText =
    currentPlayersCount - truncatedPlayers.length > 0 &&
    `+${currentPlayersCount - truncatedPlayers.length}`;
  const shortId = server.id.slice(9, 18);
  const gameServerStatus = translate('Label.CurrentPlayerCount', {
    currentPlayers: currentPlayersCount,
    maximumAllowedPlayers: server.maxPlayers
  });
  const serverIDText = translate('Label.ServerId', {
    serverId: shortId
  });
  const handleJoinPublicServer = () => {
    const commonEventParams = getCommonEventParams(groupId);

    CommunityEventStream.sendEvent(
      CommunityMetric.ExperienceServerSectionJoin({
        ...commonEventParams,
        sessionId: getImpressionId(),
        placeInstanceId: server.id,
        universeId: experienceId
      })
    );
    joinPublicServer(placeId, server.id);
  };

  return (
    <div className='rbx-public-game-server-item group-public-server-card'>
      <div className='card-item card-item-public-server'>
        <div className='player-thumbnails-container'>
          {truncatedPlayers.map(player => (
            <PlayerThumbnailContainer key={player.playerToken} player={player} />
          ))}
          {!!remainingPlayersText && (
            <span className='avatar avatar-headshot-md player-avatar hidden-players-placeholder'>
              {remainingPlayersText}
            </span>
          )}
        </div>

        <div className='rbx-public-game-server-details game-server-details'>
          <div className='text-info rbx-game-status rbx-public-game-server-status text-overflow'>
            {gameServerStatus}
          </div>
          <ServerSizeGauge
            maxPlayerCount={server.maxPlayers}
            currentPlayerCount={currentPlayersCount}
          />
          <span data-placeid={placeId}>
            <button
              type='button'
              className='btn-full-width btn-control-xs rbx-public-game-server-join game-server-join-btn'
              onClick={handleJoinPublicServer}>
              {translate('Label.ServerListJoin')}
            </button>
          </span>
          <div className='server-id-text text-info xsmall'>{serverIDText}</div>
        </div>
      </div>
    </div>
  );
};

export default GameInstanceCard;
