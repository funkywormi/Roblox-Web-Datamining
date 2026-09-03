import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

import FriendRecommendationItem from './FriendRecommendationItem';

const { useState, useEffect, useRef } = React;

// these functions are passed as the cardWidth and contentWidth props during normal execution
// the tests pass in mock functions
const cardWidthDefault = cardRef => cardRef?.current?.getBoundingClientRect()?.width;
const contentWidthDefault = contentRef => contentRef?.current?.getBoundingClientRect()?.width;

function FriendRecommendationCarousel({
  friendRecommendations,
  translate,
  setError,
  cardWidth,
  contentWidth
}) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [showScrollers, setShowScrollers] = useState(false);
  const [animateScroll, setAnimateScroll] = useState(true);
  const [screenWidth, setScreenWidth] = useState(-1);
  const contentRef = useRef(null);
  const cardRef = useRef(null);

  const scrollChange = () => Math.floor(contentWidth(contentRef) / cardWidth(cardRef));

  useEffect(() => {
    // cardWidth used as a null check for cardRef that also works with tests.
    if (cardWidth(cardRef)) {
      setScrollDistance(-scrollOffset * cardWidth(cardRef));
    }
  }, [scrollOffset, screenWidth]);

  useEffect(() => {
    setShowScrollers(
      cardWidth(cardRef) &&
        cardWidth(cardRef) * friendRecommendations.length > contentWidth(contentRef)
    );
  }, [cardWidth.current, contentWidth.current, screenWidth]);

  useEffect(() => {
    if (!showScrollers && scrollOffset > 0) {
      setScrollOffset(0);
    }
  }, [showScrollers, scrollOffset]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setScreenWidth(window.innerWidth);
      setAnimateScroll(false);
    });
    setScreenWidth(0);
  }, []);

  const friendRecommendationItems = [];
  friendRecommendations.forEach(friend => {
    friendRecommendationItems.push(
      <li
        ref={cardRef}
        data-user-id={friend.userId}
        className='list-item friend-recommendations-list-item'>
        <FriendRecommendationItem
          userId={friend.userId}
          userName={friend.userName}
          displayName={friend.displayName}
          pendingRequest={friend.pendingRequest}
          mutualFriends={friend.mutualFriendsList}
          setError={setError}
          translate={translate}
        />
      </li>
    );
  });

  const incrementScroll = left => {
    if (cardWidth(cardRef)) {
      if (left) {
        setScrollOffset(Math.max(0, scrollOffset - scrollChange()));
      } else if (scrollOffset + scrollChange() < friendRecommendationItems.length) {
        setScrollOffset(scrollOffset + scrollChange());
      }
      setAnimateScroll(true);
    }
  };

  const getScrollerClass = left => {
    let state = '';
    if (!showScrollers) {
      state = ' hidden';
    } else if (
      (left && scrollOffset === 0) ||
      (!left && scrollOffset + scrollChange() >= friendRecommendationItems.length)
    ) {
      state = ' disabled';
    }
    return `scroller${left ? '' : ' next'}${state}`;
  };

  return (
    <div
      className={ClassNames('section-content remove-panel friend-recommendations-content', {
        'friend-recommendations-content-with-scrollers': showScrollers
      })}>
      <button
        type='button'
        className={getScrollerClass(true)}
        onClick={() => incrementScroll(true)}>
        <div className='arrow'>
          <span className='icon-games-carousel-left' />
        </div>
      </button>
      <div
        ref={contentRef}
        className={ClassNames('friend-recommendations-container', {
          'animate-scroll': animateScroll
        })}
        style={{ left: `${scrollDistance}px` }}>
        <ul className='hlist'>{friendRecommendationItems}</ul>
      </div>
      <button
        type='button'
        className={getScrollerClass(false)}
        onClick={() => incrementScroll(false)}>
        <div className='arrow'>
          <span className='icon-games-carousel-right' />
        </div>
      </button>
    </div>
  );
}

FriendRecommendationCarousel.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  friendRecommendations: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  cardWidth: PropTypes.func,
  contentWidth: PropTypes.func
};

FriendRecommendationCarousel.defaultProps = {
  cardWidth: cardWidthDefault,
  contentWidth: contentWidthDefault
};

export default FriendRecommendationCarousel;
