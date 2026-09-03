import { useEffect, useRef } from "react";
import { observeVisibility } from "@rbx/core-scripts/util/element-visibility";

type LoadMoreSentinelProps = {
  onVisible: () => void;
};

/**
 * An invisible sentinel that fires `onVisible` when it scrolls into view, used to
 * drive infinite-scroll pagination.
 */
const LoadMoreSentinel = ({ onVisible }: LoadMoreSentinelProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sentinelRef.current;

    if (!element) {
      return undefined;
    }

    const disconnect = observeVisibility({ element, threshold: 0 }, visible => {
      if (visible) {
        onVisible();
      }
    });

    return disconnect;
  }, [onVisible]);

  return (
    <div
      ref={sentinelRef}
      data-testid="load-more-sentinel"
      aria-hidden="true"
      className="invisible"
    />
  );
};

export default LoadMoreSentinel;
