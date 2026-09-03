import { useState, useEffect, useCallback } from 'react';
import { Topic } from '../../../constants/types';
import { CatalogQuery } from '../../../hooks/catalogQuery/catalogQuery.types';
import UtilityService from '../../../services/utilityService';
import catalogConstants from '../../../constants/catalogConstants';
import { EventServiceDefault } from '../../../services/eventService';

export type TopicsCarousel = {
  showLeftTopicNavigationButton: boolean | undefined;
  onTopicNavigationButtonClicked: (left: boolean) => void;
  showClearTopicNavigationButton: boolean | undefined;
  onTopicClearButtonClicked: () => void;
  onTopicClicked: (topic: Topic) => void;
  showRightTopicNavigationButton: boolean | undefined;
};

const useTopics = (
  catalogQuery: CatalogQuery,
  topics: Topic[],
  setSelectedTopics: (selectedTopics: Topic[]) => void,
  onClearFilters: (keepKeyword: boolean) => void,
  clearTopics: () => void,
  carouselRef: React.RefObject<HTMLDivElement>,
  isRTL: boolean
): TopicsCarousel => {
  // We need to keep track of the container width to determine if left/right buttons are needed
  const [containerOverflow, setContainerOverflow] = useState(0);

  const topicCarouselComponent = carouselRef.current;

  // Function to calculate container widths
  const updateWidths = useCallback(() => {
    if (topicCarouselComponent) {
      setContainerOverflow(topicCarouselComponent.scrollWidth - topicCarouselComponent.offsetWidth);
    }
  }, [topicCarouselComponent]);

  // Recalculate widths whenever the window size changes
  useEffect(() => {
    updateWidths();

    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, [updateWidths]);

  // Update sizes when topics change
  useEffect(() => {
    updateWidths();
  }, [topics, catalogQuery.topics, updateWidths]);

  const [carouselPosition, setCarouselPosition] = useState<number>(0);

  const resetTopicView = useCallback(() => {
    const topicCarousel = topicCarouselComponent;
    if (!topicCarousel) {
      return;
    }

    topicCarousel.scrollLeft = 0;
    setCarouselPosition(0);
  }, [topicCarouselComponent]);

  useEffect(() => {
    resetTopicView();
  }, [resetTopicView, topics]);

  const onTopicNavigationButtonClicked = (left: boolean) => {
    const topicCarousel = topicCarouselComponent;
    if (!topicCarousel) {
      return;
    }

    let tcPosition = topicCarousel.scrollLeft;

    // Weird tracking because topicCarousel.scrollLeft does not update immediately
    if (left) {
      topicCarousel.scrollLeft -= catalogConstants.topics.topicCarouselScrollValue;
      tcPosition -= catalogConstants.topics.topicCarouselScrollValue;
    } else {
      topicCarousel.scrollLeft += catalogConstants.topics.topicCarouselScrollValue;
      tcPosition += catalogConstants.topics.topicCarouselScrollValue;
    }

    setCarouselPosition(tcPosition);
  };

  const [showLeftTopicNavigationButton, setShowLeftTopicNavigationButton] = useState<boolean>();
  const [showRightTopicNavigationButton, setShowRightTopicNavigationButton] = useState<boolean>();
  const [showClearTopicNavigationButton, setShowClearTopicNavigationButton] = useState<boolean>();

  useEffect(() => {
    const carouselPositionRelative = isRTL ? carouselPosition * -1 : carouselPosition;
    const hasOverflow = containerOverflow > 0;
    const showLeftButton = hasOverflow && carouselPositionRelative > 0;
    const showRightButton = hasOverflow && carouselPositionRelative + 1 < containerOverflow;

    setShowLeftTopicNavigationButton(showLeftButton);
    setShowRightTopicNavigationButton(showRightButton);

    const showClearButton = !showLeftButton && !!catalogQuery.topics?.length;
    setShowClearTopicNavigationButton(showClearButton);
  }, [carouselPosition, containerOverflow, catalogQuery.topics, isRTL]);

  useEffect(() => {
    const topicCarousel = topicCarouselComponent;

    // Correctly typed event parameter
    const handleScroll = (e: Event) => {
      if (topicCarousel) {
        setCarouselPosition(topicCarousel.scrollLeft);
      }
    };

    if (topicCarousel) {
      topicCarousel.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      if (topicCarousel) {
        topicCarousel.removeEventListener('scroll', handleScroll, true);
      }
    };
  }, [topicCarouselComponent]);

  const onTopicsCleared = () => {
    resetTopicView();
    onClearFilters(true);
  };

  const onTopicClearButtonClicked = () => {
    EventServiceDefault.sendTopicClearedEvent(
      catalogQuery.category?.name,
      catalogQuery.subcategory?.name,
      catalogQuery.keyword,
      UtilityService.buildTopicKeyword(topics, ',')
    );
    clearTopics();

    onTopicsCleared();
  };

  const onTopicClicked = (topic: Topic) => {
    const { category, subcategory, keyword, topics: selectedTopics } = catalogQuery;

    const index = selectedTopics.indexOf(topic);
    let newSelectedTopics = [...selectedTopics];

    const isDeselect = index > -1;

    if (isDeselect) {
      // Deselect
      EventServiceDefault.sendTopicDeselectedEvent(
        topic.displayName,
        index,
        category?.name,
        subcategory?.name,
        keyword,
        UtilityService.buildTopicKeyword(topics, ',')
      );

      newSelectedTopics = newSelectedTopics.filter((_, i) => i !== index);
    } else {
      // Select
      EventServiceDefault.sendTopicSelectedEvent(
        topic.displayName,
        topics.indexOf(topic),
        category?.name,
        subcategory?.name,
        keyword,
        UtilityService.buildTopicKeyword(topics, ','),
        UtilityService.buildTopicKeyword(selectedTopics, ',')
      );

      newSelectedTopics.push(topic);
    }

    setSelectedTopics(newSelectedTopics);

    if (!newSelectedTopics.length) {
      onTopicsCleared();
    }
    resetTopicView();
  };

  return {
    showLeftTopicNavigationButton,
    onTopicNavigationButtonClicked,
    showClearTopicNavigationButton,
    onTopicClearButtonClicked,
    onTopicClicked,
    showRightTopicNavigationButton
  };
};

export default useTopics;
