import { CurrentUser, EventStream, CaptchaService, GameLauncher, Guac } from 'Roblox';
import React, { useState, useEffect, useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { dataStores, entityUrl } from 'core-roblox-utilities';
import { Thumbnail2d, ThumbnailTypes, DefaultThumbnailSize } from 'roblox-thumbnails';
import { AvatarCardItem, Button, Tooltip } from 'react-style-guide';
import {
  PresenceStatusIcon,
  PresenceStatusLabel,
  PresenceType,
  usePresence
} from 'roblox-presence';
import translationConfig from '../translation.config';
import FriendCardFooter from './FriendCardFooter';
import friendsConstants from '../constants/friendsConstants';
import urlConstants from '../constants/urlConstants';
import appContainer from '../containers/appContainer';
import friendsService from '../services/friendsService';
import { FriendsMetadataContext } from '../context/friendsMetadataContext';

const {
  FRIENDTABS,
  EVENTS,
  FRIENDS_REQUEST_LIST_CONTEXT,
  PLUS_SIGN,
  MUTUAL_FRIENDS_SHOW_COUNT,
  UNAVAILABLE_FRIEND_NAME
} = friendsConstants;

const { userDataStore } = dataStores;

const FriendCard = ({
  id,
  name,
  displayName,
  verifiedBadgeData,
  isRobloxPlus,
  isDeleted,
  friendRequestSentFromInGame,
  friendRequestSentFromQrCode,
  friendRequestSentAt,
  sourceUniverse,
  mutualFriends,
  position,
  currentTab,
  isMyProfile,
  translate,
  unfollowFriend,
  unfriend,
  followFriend,
  acceptFriendRequestThenRemoveCard,
  declineFriendRequestThenRemoveCard,
  refreshFriendsList,
  presence
}) => {
  // local state used for following tab only
  const [isFollowed, setIsFollowed] = useState(true);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [captchaActivated, setCaptchaActivated] = useState(false);
  const [dxBlob, setDxBlob] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  // used one time only to turn menu off when user unfollow deleted user
  const [toggleMenuOff, setToggleMenuOff] = useState(false);

  const generateReferralLinkToPlace = _placeId => {
    return entityUrl.game.getRelativePath(_placeId);
  };

  const hasMenu = currentTab === FRIENDTABS.FOLLOWING && isMyProfile && !toggleMenuOff;
  const hasBtn = currentTab === FRIENDTABS.FRIENDREQUESTS && isMyProfile;
  const showUnfriendMenu = currentTab === FRIENDTABS.FRIENDS && isDeleted && isMyProfile;
  const profileUrl = urlConstants.getUserProfileUrl(id);
  const hasGameContext = sourceUniverse?.name && sourceUniverse?.rootPlaceId;
  const hasMutualFriends = mutualFriends.length > 0;
  let firstLineText = (
    <PresenceStatusLabel
      userId={id}
      translate={translate}
      linkUrlGetter={generateReferralLinkToPlace}
      linkClassNames={['avatar-status-link', 'text-link']}
    />
  );
  let secondLineText = '';
  let footer;
  let truncateFirstLine = false;

  const { showJoinGameButtonInFriendCardDesktopOnly } = useContext(FriendsMetadataContext);

  const presenceData = usePresence(id, presence);
  const [gameIsPlayable, setGameIsPlayable] = useState(presence.isPlayable);

  useEffect(() => {
    if (presenceData.userPresenceType === PresenceType.Game) {
      if (presenceData.universeId === presence.universeId) {
        setGameIsPlayable(presence.isPlayable);
      } else {
        friendsService.getGamePlayabilities([presenceData.universeId]).then(resp => {
          setGameIsPlayable(resp?.data[0]?.isPlayable ?? false);
        });
      }
    }
  }, [presenceData]);

  const { placeId, gameId: gameInstanceId } = presenceData;

  const launchGame = (_placeId, _userId, _gameInstanceId) => {
    GameLauncher.followPlayerIntoGame(_userId);
  };

  const [isTrustedConnection, setTrustedConnection] = useState(false);
  useEffect(() => {
    friendsService.getTrustedConnectionStatus(id).then(response => {
      setTrustedConnection(
        response.data.status === friendsConstants.TRUSTED_FRIEND_STATUS.TrustedFriends
      );
    });
  }, [id]);

  const initPresenceStatusGame = () => {
    const locationLink = generateReferralLinkToPlace(placeId);

    if (gameIsPlayable && showJoinGameButtonInFriendCardDesktopOnly) {
      return {
        lastLocationLink: locationLink,
        truncateFirstLine: true,
        footer: (
          <Button
            onClick={() => launchGame(placeId, id, gameInstanceId)}
            size='sm'
            width='full'
            variant='growth'>
            {translate('Action.JoinGame')}
          </Button>
        )
      };
    }
    return {
      lastLocationLink: locationLink,
      truncateFirstLine: false,
      footer: null
    };
  };

  const generateMutualFriendsListItems = mutualFriendsList => {
    const listItems = mutualFriendsList
      .slice(0, MUTUAL_FRIENDS_SHOW_COUNT)
      .map(mutualFriend => <li className='text-overflow'>{mutualFriend}</li>);

    if (mutualFriendsList.length > MUTUAL_FRIENDS_SHOW_COUNT) {
      const remainingCount = mutualFriendsList.length - MUTUAL_FRIENDS_SHOW_COUNT;
      const remainingCountMessage = translate('Message.More', {
        plusSign: PLUS_SIGN,
        remainingCount
      });
      listItems.push(<li className='text-overflow'>{remainingCountMessage}</li>);
    }

    return listItems;
  };

  if (currentTab === FRIENDTABS.FRIENDS || currentTab === FRIENDTABS.FOLLOWING) {
    if (presenceData.userPresenceType === PresenceType.Game) {
      ({ truncateFirstLine, footer } = initPresenceStatusGame());
    }

    if (currentTab === FRIENDTABS.FOLLOWING && !isFollowed) {
      secondLineText = translate('Label.Unfollowed');
    }
  } else if (currentTab === FRIENDTABS.FRIENDREQUESTS) {
    // We don't want to show anything in the last location section to avoid over crowding the avatar card
    firstLineText = '';

    // This is the default behaviour and should be retained after the FRIEND_REQUEST_CONTEXT_VARIANTS experiment ends | START
    const gameContextFooter = rootPlaceId => {
      const footerLink = generateReferralLinkToPlace(rootPlaceId);
      return (
        <Fragment>
          {translate('Label.SentFrom')}{' '}
          <a href={footerLink} className='text-link avatar-card-footer-link'>
            {sourceUniverse.name}
          </a>
        </Fragment>
      );
    };
    // This is the default behaviour and should be retained after the FRIEND_REQUEST_CONTEXT_VARIANTS experiment ends | END

    const mutualFriendsContextFooter = mutualFriendsList => {
      const children = generateMutualFriendsListItems(mutualFriendsList);
      return (
        <Tooltip id='mutual-friends-tooltip' placement='bottom' content={children}>
          <span className='mutual-friends-tooltip-label'>
            {translate('Label.WebMutualFriend', {
              mutualConnectionsCount: mutualFriendsList.length
            })}
          </span>
        </Tooltip>
      );
    };

    if (hasMutualFriends) {
      footer = mutualFriendsContextFooter(mutualFriends);
    } else if (hasGameContext) {
      footer = gameContextFooter(sourceUniverse.rootPlaceId);
    } else if (friendRequestSentFromQrCode) {
      footer = translate('Label.SentFromQrCode');
    }
  }

  // regardless of tab, if user is deleted, show presence 'Inactive'
  if (isDeleted) {
    firstLineText = translate('Label.Inactive');
  }

  const thumbnail = (
    <Thumbnail2d
      type={ThumbnailTypes.avatarHeadshot}
      size={DefaultThumbnailSize}
      targetId={id}
      includeProfileFrame
      containerClass='avatar-card-image'
    />
  );

  useEffect(() => {
    const captchaOptions = {
      captchaActionType: 'followUser',
      captchaActivated,
      captchaError: () => {
        setCaptchaActivated(false);
      },
      captchaSuccess: data => {
        setCaptchaActivated(false);
        followFriend(id, data).then(() => setIsFollowed(true));
      },
      captchaReturnTokenInSuccessCb: true,
      captchaDismissed: () => {
        setCaptchaActivated(false);
      },
      endCaptcha: () => {
        setCaptchaActivated(false);
      },
      inputParams: { dataExchange: dxBlob, unifiedCaptchaId: captchaId }
    };
    CaptchaService.openCaptcha(captchaOptions);
  }, [captchaActivated]);

  return (
    <AvatarCardItem.Default id={id} disableCard={isDeleted || isSendingRequest || id < 0}>
      <AvatarCardItem.Content>
        <AvatarCardItem.Headshot
          imageLink={!isDeleted ? profileUrl : ''}
          statusIcon={<PresenceStatusIcon translate={translate} userId={id} />}
          thumbnail={thumbnail}
        />

        <AvatarCardItem.Caption
          name={name ?? translate(UNAVAILABLE_FRIEND_NAME)}
          displayName={displayName ?? translate(UNAVAILABLE_FRIEND_NAME)}
          nameLink={!isDeleted ? profileUrl : ''}
          labelFirstLine={firstLineText}
          labelSecondLine={secondLineText}
          footer={footer && <FriendCardFooter>{footer}</FriendCardFooter>}
          hasMenu={hasMenu || showUnfriendMenu}
          truncateFirstLine={truncateFirstLine}
          verifiedBadgeData={verifiedBadgeData}
          isRobloxPlus={isRobloxPlus}
          isTrustedConnection={isTrustedConnection}
        />

        {hasMenu && (
          <AvatarCardItem.Menu>
            {isFollowed && (
              <AvatarCardItem.MenuItem
                className='friend-unfollow'
                title={translate('Action.Unfollow')}
                onClick={e => {
                  e.preventDefault();
                  unfollowFriend(id).then(() => setIsFollowed(false));
                  if (isDeleted) {
                    setToggleMenuOff(true);
                    userDataStore.clearUserDataStoreCache();
                  }
                }}
              />
            )}
            {!isFollowed && (
              <AvatarCardItem.MenuItem
                className='friend-follow'
                title={translate('Action.Follow')}
                onClick={e => {
                  e.preventDefault();
                  followFriend(id).then(
                    () => setIsFollowed(true),
                    error => {
                      const captchaFields = error.message;
                      try {
                        const jsonData = JSON.parse(captchaFields);
                        setDxBlob(jsonData.dxBlob);
                        setCaptchaId(jsonData.unifiedCaptchaId);
                      } catch (err) {
                        setDxBlob(captchaFields);
                      }
                      setCaptchaActivated(true);
                    }
                  );
                }}
              />
            )}
          </AvatarCardItem.Menu>
        )}
        {showUnfriendMenu && (
          <AvatarCardItem.Menu>
            <AvatarCardItem.MenuItem
              className='friend-unfriend'
              title={translate('Label.RemoveFriend')}
              onClick={() => {
                unfriend(id).then(refreshFriendsList);
              }}
            />
          </AvatarCardItem.Menu>
        )}
      </AvatarCardItem.Content>
      {hasBtn && (
        <AvatarCardItem.ButtonGroup>
          <Button
            isLoading={isSendingRequest}
            className='ignore-friend'
            onClick={() => {
              setIsSendingRequest(true);
              declineFriendRequestThenRemoveCard({ id }).finally(() => {
                setIsSendingRequest(false);
              });
            }}
            variant='secondary'
            size='md'>
            {translate('Action.Ignore')}
          </Button>
          <Button
            isLoading={isSendingRequest}
            className='accept-friend'
            onClick={() => {
              setIsSendingRequest(true);
              acceptFriendRequestThenRemoveCard({ id })
                .then(() => {
                  const eventData = {
                    senderUserId: id,
                    currentUserId: CurrentUser.userId,
                    sentFromInGame: friendRequestSentFromInGame,
                    sentFromQrCode: friendRequestSentFromQrCode,
                    timeFriendRequestWasSent: friendRequestSentAt
                  };
                  EventStream.SendEvent(
                    EVENTS.ACCEPTED_FRIEND_REQUEST,
                    FRIENDS_REQUEST_LIST_CONTEXT,
                    eventData
                  );
                })
                .finally(() => {
                  setIsSendingRequest(false);
                });
            }}
            variant='cta'
            size='md'>
            {translate('Action.Accept')}
          </Button>
        </AvatarCardItem.ButtonGroup>
      )}
    </AvatarCardItem.Default>
  );
};

FriendCard.defaultProps = {
  verifiedBadgeData: null,
  isRobloxPlus: false,
  isDeleted: false,
  friendRequestSentAt: null,
  sourceUniverse: null,
  mutualFriends: [],
  presence: {
    universeId: undefined
  }
};

FriendCard.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  verifiedBadgeData: PropTypes.shape({
    hasVerifiedBadge: PropTypes.bool,
    titleText: PropTypes.string
  }),
  // SUBS-5048: Roblox Plus subscriber, sourced from `usePlusStatus`
  // (web-plus-identity-badge GUAC bundle).
  isRobloxPlus: PropTypes.bool,
  isDeleted: PropTypes.bool,
  friendRequestSentFromInGame: PropTypes.bool.isRequired,
  friendRequestSentFromQrCode: PropTypes.bool.isRequired,
  friendRequestSentAt: PropTypes.string,
  sourceUniverse: PropTypes.shape({
    name: PropTypes.string,
    rootPlaceId: PropTypes.number
  }),
  mutualFriends: PropTypes.arrayOf(PropTypes.string),
  position: PropTypes.number.isRequired,
  currentTab: PropTypes.string.isRequired,
  isMyProfile: PropTypes.bool.isRequired,
  translate: PropTypes.func.isRequired,
  unfollowFriend: PropTypes.func.isRequired,
  unfriend: PropTypes.func.isRequired,
  followFriend: PropTypes.func.isRequired,
  acceptFriendRequestThenRemoveCard: PropTypes.func.isRequired,
  declineFriendRequestThenRemoveCard: PropTypes.func.isRequired,
  refreshFriendsList: PropTypes.func.isRequired,
  presence: PropTypes.shape({
    isPlayable: PropTypes.bool.isRequired,
    universeId: PropTypes.number
  })
};

export default withTranslations(appContainer(FriendCard), translationConfig);
