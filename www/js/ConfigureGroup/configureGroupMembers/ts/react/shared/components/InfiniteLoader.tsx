import React, { useEffect, useRef } from 'react';

type InfiniteLoaderProps = {
  onLoadMore: () => void;
  viewingThreshold: number;
};

const InfiniteLoader: React.FC<InfiniteLoaderProps> = ({ onLoadMore, viewingThreshold }) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: viewingThreshold }
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
