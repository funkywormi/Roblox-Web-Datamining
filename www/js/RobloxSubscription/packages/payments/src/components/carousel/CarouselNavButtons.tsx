import classNames from "classnames";
import type { CSSProperties } from "react";
import { useContext } from "react";
import { IconButton } from "@rbx/foundation-ui";

import { CarouselContext } from "./CarouselContext";

/**
 * Buttons sit at the inner edges of the track (no negative offset / translate)
 * so they never paint past the carousel's bounding box — the parent root
 * also clips with `clip-x` as belt-and-suspenders against page-level overflow.
 *
 * Inline style is used because the foundation-tailwind preset does not ship
 * `top-*`, `left-*`, `right-*`, `z-*`, or `translate-*` utilities.
 */
const PREV_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: 0,
  transform: "translateY(-50%)",
  zIndex: 10,
};
const NEXT_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: "50%",
  right: 0,
  transform: "translateY(-50%)",
  zIndex: 10,
};

export type CarouselNavButtonProps = {
  ariaLabel: string;
  className?: string;
};

/**
 * Floats over the carousel root at the left edge and is hidden when there is
 * no previous page to scroll to. Disabled state is also reported (keeps the
 * button in DOM order if the consumer prefers to render it always).
 */
function CarouselPrevButton({ ariaLabel, className }: CarouselNavButtonProps) {
  const { canPrev, prev } = useContext(CarouselContext);

  if (!canPrev) {
    return null;
  }

  return (
    <IconButton
      ariaLabel={ariaLabel}
      className={classNames(className)}
      data-testid="carousel-prev-button"
      icon="icon-filled-chevron-large-left"
      isCircular
      onClick={prev}
      size="Medium"
      style={PREV_BUTTON_STYLE}
      variant="OverMedia"
    />
  );
}

function CarouselNextButton({ ariaLabel, className }: CarouselNavButtonProps) {
  const { canNext, next } = useContext(CarouselContext);

  if (!canNext) {
    return null;
  }

  return (
    <IconButton
      ariaLabel={ariaLabel}
      className={classNames(className)}
      data-testid="carousel-next-button"
      icon="icon-filled-chevron-large-right"
      isCircular
      onClick={next}
      size="Medium"
      style={NEXT_BUTTON_STYLE}
      variant="OverMedia"
    />
  );
}

export { CarouselPrevButton, CarouselNextButton };
