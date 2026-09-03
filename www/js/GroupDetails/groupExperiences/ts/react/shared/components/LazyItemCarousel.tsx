import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  ReactNode
} from 'react';
import classNames from 'classnames';
import ItemCarousel from './ItemCarousel';

export type LazyItemCarouselHandle = {
  resetScroll: () => void;
};

type LazyItemCarouselProps = {
  className?: string;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  children: ReactNode;
};

const LazyItemCarousel = forwardRef<LazyItemCarouselHandle, LazyItemCarouselProps>(
  function LazyItemCarousel({ className, onLoadMore, hasMore, children }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const loadMore = useCallback(async () => {
      if (!onLoadMore) return;
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
    }, [onLoadMore]);

    const onScroll = useCallback(() => {
      // this ensures we always have enough content loaded to do a full scroll cycle
      const scrollNode = scrollRef.current;
      if (!scrollNode) return;

      const { scrollLeft, scrollWidth, clientWidth } = scrollNode;
      const cannotFullyScrollOnArrowClick = scrollWidth - scrollLeft < 2 * clientWidth;
      if (!isLoadingMore && hasMore && cannotFullyScrollOnArrowClick) {
        // eslint-disable-next-line no-void
        void loadMore();
      }
    }, [loadMore, isLoadingMore, hasMore]);

    useImperativeHandle(
      ref,
      () => ({
        resetScroll: () => {
          scrollRef.current?.scrollTo({ left: 0 });
        }
      }),
      []
    );

    return (
      <ItemCarousel
        className={classNames('lazy-item-carousel', className)}
        controlsDisabled={isLoadingMore}
        onScroll={onScroll}
        scrollRef={scrollRef}>
        {children}
        {isLoadingMore && <div className='lazy-item-carousel-loader shimmer' />}
      </ItemCarousel>
    );
  }
);

export default LazyItemCarousel;
