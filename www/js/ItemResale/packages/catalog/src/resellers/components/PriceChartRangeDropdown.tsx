import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";

type TPriceChartRangeDropdownProps = {
  dayOptions: readonly number[];
  selectedDays: number;
  onSelect: (days: number) => void;
  formatDays: (days: number) => string;
};

// uib-dropdown's replacement, kept to the same markup and class names the Angular template emits.
const PriceChartRangeDropdown = ({
  dayOptions,
  selectedDays,
  onSelect,
  formatDays,
}: TPriceChartRangeDropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const { target } = event;
      if (dropdownRef.current && !dropdownRef.current.contains(target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={classNames("input-group-btn", "price-chart-range-dropdown", { open: isOpen })}
    >
      <button
        type="button"
        className="input-dropdown-btn"
        aria-haspopup="true"
        aria-expanded={isOpen ? "true" : "false"}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
      >
        <span className="rbx-selection-label">{formatDays(selectedDays)}</span>
        <span className="icon-down-16x16" />
      </button>
      <ul className="dropdown-menu" role="menu" style={{ display: isOpen ? "block" : "none" }}>
        {dayOptions.map(dayCount => (
          <li key={dayCount}>
            <button
              type="button"
              onClick={() => {
                onSelect(dayCount);
                setIsOpen(false);
              }}
            >
              {formatDays(dayCount)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PriceChartRangeDropdown;
