import React, { useEffect, useState } from 'react';
import { usePost } from '../contexts/PostContext';
import useViewportSize from '../../shared/hooks/useViewportSize';

type PostScrollHandlerProps = {
  postScrollContainerRef: React.RefObject<HTMLDivElement>;
};

const usePostScrollEffects = ({ postScrollContainerRef }: PostScrollHandlerProps): void => {
  const { isFetchingPreviousCommentsPage } = usePost();
  const { isSmallViewport } = useViewportSize();
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);

  // when previous comments load, maintain visual consistency in scroll position
  useEffect(() => {
    const scrollElement = isSmallViewport
      ? postScrollContainerRef.current
      : document.documentElement;
    if (!scrollElement) return;

    if (isFetchingPreviousCommentsPage) {
      // save current scroll height when we start loading previous comments
      setPreviousScrollHeight(scrollElement.scrollHeight);
    } else if (!isFetchingPreviousCommentsPage && previousScrollHeight > 0) {
      // calculate the difference in scroll position after loading previous comments
      const scrollHeightDiff = scrollElement.scrollHeight - previousScrollHeight;
      // scroll to the same position as before loading previous comments
      scrollElement.scrollTop += scrollHeightDiff;
      setPreviousScrollHeight(0);
    }
  }, [
    previousScrollHeight,
    isFetchingPreviousCommentsPage,
    isSmallViewport,
    postScrollContainerRef
  ]);

  // disable scrolling on document when post is open on mobile to prevent janky multi-scroll scenarios
  useEffect(() => {
    document.documentElement.classList.add('overflow-hidden-native');
    return () => {
      document.documentElement.classList.remove('overflow-hidden-native');
    };
  }, []);
};

export default usePostScrollEffects;
