import React, { useRef } from 'react';
import { Topic } from '../../../constants/types';
import { CatalogQuery } from '../../../hooks/catalogQuery/catalogQuery.types';
import useTopics from './useTopics';
import useIsRTL from '../../../hooks/useIsRTL';
import TopicPill from './TopicPill';

export type TopicCarouselProps = {
  topicBasedBrowsingEnabledForCategory?: boolean;
  catalogQuery: CatalogQuery;
  topics: Topic[];
  setSelectedTopics: (selectedTopics: Topic[]) => void;
  onClearFilters: (keepKeyword: boolean) => void;
  clearTopics: () => void;
};

export function TopicsCarousel(props: TopicCarouselProps): JSX.Element {
  const {
    topicBasedBrowsingEnabledForCategory,
    catalogQuery,
    topics,
    setSelectedTopics,
    onClearFilters,
    clearTopics
  } = props;

  const carouselRef = useRef<HTMLDivElement>(null);

  const isRTL = useIsRTL();
  const {
    showLeftTopicNavigationButton,
    onTopicNavigationButtonClicked,
    showClearTopicNavigationButton,
    onTopicClearButtonClicked,
    onTopicClicked,
    showRightTopicNavigationButton
  } = useTopics(
    catalogQuery,
    topics,
    setSelectedTopics,
    onClearFilters,
    clearTopics,
    carouselRef,
    isRTL
  );

  const leftIconClass = isRTL ? 'icon-right-gray' : 'icon-left-gray';
  const rightIconClass = isRTL ? 'icon-left-gray' : 'icon-right-gray';

  return (
    <React.Fragment>
      {topicBasedBrowsingEnabledForCategory && (
        <div className='topic-container'>
          {/* Topic Navigation Left */}
          {showLeftTopicNavigationButton && (
            <span className='topic-navigation-left topic-navigation-blur-left'>
              <button
                type='button'
                className='topic-navigation-button'
                onClick={() => onTopicNavigationButtonClicked(!isRTL)}>
                <span className={leftIconClass} />
              </button>
            </span>
          )}

          {/* Topic Clear Button */}
          {showClearTopicNavigationButton && (
            <span className='topic-navigation-clear'>
              <button
                type='button'
                className='topic-navigation-button'
                onClick={onTopicClearButtonClicked}>
                <span className='icon-actions-clear-sm' />
              </button>
            </span>
          )}

          {/* Topics */}
          <span className='topic-carousel' id='topic-carousel' ref={carouselRef}>
            {catalogQuery.topics.map(topic => (
              <TopicPill
                key={topic.displayName}
                onTopicClicked={onTopicClicked}
                topic={topic}
                isSelected
              />
            ))}
            {topics.map(topic => (
              <TopicPill
                key={topic.displayName}
                onTopicClicked={onTopicClicked}
                topic={topic}
                isSelected={false}
              />
            ))}
          </span>

          {/* Placeholder */}
          {(!catalogQuery.topics ||
            !topics ||
            (catalogQuery.topics.length === 0 && topics.length === 0)) && (
            <span className='topic-carousel-placeholder' />
          )}

          {/* Topic Navigation Right */}
          {showRightTopicNavigationButton && (
            <span className='topic-navigation-right topic-navigation-blur-right'>
              <button
                type='button'
                className='topic-navigation-button'
                onClick={() => onTopicNavigationButtonClicked(isRTL)}>
                <span className={rightIconClass} />
              </button>
            </span>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default TopicsCarousel;
