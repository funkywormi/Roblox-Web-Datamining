import classNames from "classnames";
import type { CSSProperties } from "react";
import { useContext } from "react";

import { CarouselContext } from "./CarouselContext";

export type CarouselIndicatorProps = {
  className?: string;
  /** Optional override for the per-dot accessible label (e.g. "Tier %{n} of %{total}"). */
  formatDotLabel?: (index: number, total: number) => string;
};

/**
 * Dot styling lives inline because the foundation-tailwind preset doesn't
 * ship `rounded-*`, `opacity-*`, or `transition-opacity` utilities. The
 * size + color tokens are the only Tailwind utilities that survive the preset.
 */
const DOT_STYLE_BASE: CSSProperties = {
  borderRadius: "9999px",
  border: "none",
  padding: 0,
  cursor: "pointer",
  transition: "opacity var(--time-100) var(--ease-linear)",
};

function defaultFormatDotLabel(index: number, total: number): string {
  return `Page ${String(index + 1)} of ${String(total)}`;
}

/**
 * Page-position dots that auto-hide whenever the carousel is in single-page mode
 * (one item, or every item already visible at once on a wide viewport). Each dot
 * is a button so the indicator doubles as a quick-jump navigator.
 */
function CarouselIndicator({
  className,
  formatDotLabel = defaultFormatDotLabel,
}: CarouselIndicatorProps) {
  const { itemCount, currentPage, allVisible, goTo } = useContext(CarouselContext);

  if (itemCount <= 1 || allVisible) {
    return null;
  }

  return (
    <div
      className={classNames("flex flex-row items-center justify-center gap-small", className)}
      data-testid="carousel-indicator"
      role="tablist"
    >
      {Array.from({ length: itemCount }, (_, index) => {
        const isActive = index === currentPage;
        return (
          <button
            aria-label={formatDotLabel(index, itemCount)}
            aria-selected={isActive}
            className="content-emphasis size-[8px]"
            data-testid={`carousel-indicator-dot-${String(index)}`}
            key={index}
            onClick={() => {
              goTo(index);
            }}
            role="tab"
            style={{ ...DOT_STYLE_BASE, opacity: isActive ? 1 : 0.22 }}
            type="button"
          />
        );
      })}
    </div>
  );
}

export { CarouselIndicator };
