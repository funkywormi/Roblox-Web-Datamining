import React, { useEffect, useRef } from 'react';

type InfiniteLoaderProps = {
  onLoadMore: () => void;
  viewingThreshold: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
};

const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({ onLoadMore, viewingThreshold, scrollContainerRef }) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: viewingThreshold, root: scrollContainerRef?.current ?? null }
    );

    const currentLoader = loaderRef.current;

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [onLoadMore, viewingThreshold]);

  return <div ref={loaderRef} style={{ height: '1px' }} />;
};

export default InfiniteLoader;
