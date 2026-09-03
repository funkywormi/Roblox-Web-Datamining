import React from "react";
import { Icon } from "@rbx/foundation-ui";

export type TabScrollDirection = "prev" | "next";

type TabScrollButtonProps = {
  direction: TabScrollDirection;
  onClick: () => void;
};

/**
 * Circular chevron button used to horizontally scroll the avatar editor tab nav.
 */
const TabScrollButton = ({ direction, onClick }: TabScrollButtonProps): JSX.Element => {
  return (
    <div
      data-testid="game-carousel-scroll-bar"
      className={`scroller-new ${direction}`}
      onClick={onClick}
      aria-disabled={false}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Icon
        name={
          direction === "next"
            ? "icon-regular-chevron-small-right"
            : "icon-regular-chevron-small-left"
        }
        size="Medium"
      />
    </div>
  );
};

export default TabScrollButton;
