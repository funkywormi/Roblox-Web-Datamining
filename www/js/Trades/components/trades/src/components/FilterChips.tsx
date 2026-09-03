import { useCallback, useEffect, useRef, useState } from "react";
import { Chip } from "@rbx/foundation-ui";

export type FilterChipOption = {
  value: string;
  label: string;
};

export type FilterChipsProps = {
  options: FilterChipOption[];
  value: string;
  /**
   * Called on every press, including a press of the already-selected chip, which
   * callers that fetch per option can treat as a request to reload.
   */
  onSelect: (value: string) => void;
};

/**
 * Single-select filter rendered as one horizontal row of Foundation chips, used
 * for the trades status tabs in place of a dropdown so every status is visible
 * and one click away.
 *
 * The row scrolls rather than wraps, so it keeps a fixed height no matter how
 * many statuses there are; a gradient fade on either edge signals that there is
 * more to scroll to that way.
 */
export const FilterChips = ({ options, value, onSelect }: FilterChipsProps): JSX.Element => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Record<string, HTMLElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const measureOverflow = useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    // 1px tolerance: fractional layout widths otherwise leave a permanent
    // sub-pixel remainder that would keep a fade visible at the end of a scroll.
    setCanScrollLeft(element.scrollLeft > 1);
    setCanScrollRight(element.scrollWidth - element.clientWidth - element.scrollLeft > 1);
  }, []);

  useEffect(() => {
    measureOverflow();
    window.addEventListener("resize", measureOverflow);
    return () => {
      window.removeEventListener("resize", measureOverflow);
    };
  }, [measureOverflow, options]);

  // Bring the selected chip fully into view, so picking a clipped one does not
  // leave it half under a fade. `scroll-padding-inline` on the scroller keeps the
  // reveal clear of the fades, and `nearest` scrolls the minimum needed, leaving
  // an already-visible chip (and the vertical page position) alone.
  useEffect(() => {
    chipRefs.current[value]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);

  return (
    <div className="trade-filter-chips">
      <div
        className="trade-filter-chips-scroll"
        ref={scrollRef}
        onScroll={measureOverflow}
        role="group"
      >
        {options.map(option => (
          <Chip
            key={option.value}
            ref={(element: HTMLElement | null) => {
              chipRefs.current[option.value] = element;
            }}
            text={option.label}
            size="Medium"
            isChecked={option.value === value}
            // Chip is a toggle, but this filter is single-select, so the unpress of
            // the active chip re-selects it instead of clearing it: exactly one
            // option stays selected, and the caller can treat the repeat selection
            // as a request to reload. `isChecked` is controlled, so the chip never
            // renders as deselected in between.
            onCheckedChange={() => {
              onSelect(option.value);
            }}
          />
        ))}
      </div>

      {canScrollLeft && <div className="trade-filter-chips-fade-start" aria-hidden />}
      {canScrollRight && <div className="trade-filter-chips-fade-end" aria-hidden />}
    </div>
  );
};

export default FilterChips;
