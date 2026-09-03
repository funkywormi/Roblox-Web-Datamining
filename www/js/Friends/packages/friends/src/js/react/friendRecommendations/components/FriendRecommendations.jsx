import PropTypes from 'prop-types';
import React from 'react';
import { CurrentUser } from 'Roblox';
import { createModal } from 'react-style-guide';
import FriendRecommendationCarousel from './FriendRecommendationCarousel';
import friendService from '../services/friendService';
import eventStreamService from '../services/eventStreamService';
import productExperimentationService from '../../../../ts/common/services/productExperimentationService';
import FriendsExperimentationType from '../../../../ts/common/enums/FriendsExperimentationType';
import FriendRecommendationSource from '../../../../ts/common/enums/FriendRecommendationSource';

const { useState, useEffect } = React;

const [Modal, modalService] = createModal();

function FriendRecommendations({ translate }) {
  const [friendRecommendations, setFriendRecommendations] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const experimentResponse = await productExperimentationService.getFriendsExperimentationValues(
          [FriendsExperimentationType.FriendRecommendationSource]
        );
        if (
          experimentResponse.data?.[FriendsExperimentationType.FriendRecommendationSource] &&
          experimentResponse.data[FriendsExperimentationType.FriendRecommendationSource] !==
            FriendRecommendationSource.None
        ) {
          const friendsResponse = await friendService.getFriendCount(CurrentUser.userId);
          if (
            typeof friendsResponse.data?.count !== 'undefined' &&
            friendsResponse.data.count < 200
          ) {
            const recommendations = await friendService.getFriendRecommendations(
              CurrentUser.userId
            );
            if (recommendations.length > 0) {
              setHasLoaded(true);
              setFriendRecommendations(recommendations);
              eventStreamService.emitCarouselDisplayedEvent(
                CurrentUser.userId,
                experimentResponse.data[FriendsExperimentationType.FriendRecommendationSource],
                recommendations.length
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (error !== '') {
      modalService.open().catch(() => setError(''));
    }
  }, [error]);

  if (hasLoaded) {
    return (
      <div className='section col-xs-12 friend-recommendations-section'>
        <div className='container-header'>
          <h4>{translate('Label.FriendRecommendationsHeader')}</h4>
        </div>
        <FriendRecommendationCarousel
          friendRecommendations={friendRecommendations}
          translate={translate}
          setError={setError}
        />
        <Modal
          title={translate('Label.ErrorHeader')}
          body={error}
          neutralButtonText={translate('Action.OK')}
        />
      </div>
    );
  }

  return <div />;
}

FriendRecommendations.propTypes = {
  translate: PropTypes.func.isRequired
};

export default FriendRecommendations;
