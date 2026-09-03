import classNames from 'classnames';
import React, { useMemo, useState, useRef, useCallback } from 'react';
import useThrottledScroll from '../hooks/useThrottledScroll';

type VirtualizedListProps = {
  className?: string;
  items: any[];
  itemHeight: number;
  bufferSize?: number;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  renderItem: (props: any, index: number) => React.ReactNode;
};

const VirtualizedList: React.FC<VirtualizedListProps> = ({
  className,
  items,
  itemHeight,
  renderItem,
  bufferSize = 5,
  scrollContainerRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    let scrollTop;
    let viewportHeight;

    if (scrollContainerRef?.current) {
      scrollTop = scrollContainerRef.current.scrollTop;
      viewportHeight = scrollContainerRef.current.clientHeight;
    } else {
      viewportHeight = window.innerHeight;
      const rect = containerRef.current.getBoundingClientRect();
      scrollTop = Math.max(0, -rect.top);
    }

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight) + bufferSize
    );

    setVisibleRange({ start, end });
  }, [items.length, itemHeight, bufferSize, scrollContainerRef]);

  useThrottledScroll({ onScroll: handleScroll, scrollContainerRef });

  const visibleChildren = useMemo(() => {
    return items
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => renderItem(item, index));
  }, [items, visibleRange, renderItem]);

  const topPaddingHeight = visibleRange.start * itemHeight;
  const bottomPaddingHeight = (items.length - visibleRange.end) * itemHeight;

  return (
    <div ref={containerRef} className={classNames(className, 'relative')}>
      {topPaddingHeight > 0 && <div style={{ height: topPaddingHeight }} />}
      {visibleChildren}
      {bottomPaddingHeight > 0 && <div style={{ height: bottomPaddingHeight }} />}
    </div>
  );
};

export default VirtualizedList;
