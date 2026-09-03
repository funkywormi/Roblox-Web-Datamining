import React from "react";
import classnames from "classnames";
import { Button } from "@rbx/core-ui";
import { TranslateFunction } from "@rbx/core-scripts/react";
import carouselConstants from "../constants/carouselConstants";

const { carouselTranslationMap } = carouselConstants;

type TMediaCarouselScrollButtonsProps = {
  showControls: boolean;
  back: () => void;
  next: () => void;
  translate: TranslateFunction;
};

/**
 * Renders the left and right scroll buttons for the Experience Details page media carousel.
 */
const MediaCarouselScrollButtons = ({
  showControls,
  back,
  next,
  translate,
}: TMediaCarouselScrollButtonsProps): JSX.Element => {
  const handleButtonBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    // Blur events for these buttons are bubbled up when interacting with the YouTube player
    // To prevent unintended behavior in parent elements with good keyboard navigation support,
    // stop the propagation of those events here.
    event.stopPropagation();
  };

  const onMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    // On Safari, clicking a Video Player control and then clicking the scroll button can cause the
    // carousel to lose focus (call onBlur) and hide the controls too early (before the click can register).
    // We can prevent the default behavior of the scroll button (stealing focus) to prevent this.
    event.preventDefault();
  };

  return (
    <div
      className={classnames("carousel-controls-container", {
        "carousel-controls-container-visible": showControls,
      })}
      data-testid="carousel-controls-container"
    >
      <Button
        className="carousel-controls carousel-controls-left"
        onClick={back}
        onMouseDown={onMouseDown}
        onBlur={handleButtonBlur}
        aria-label={translate(carouselTranslationMap.back)}
        data-testid="carousel-back-button"
      >
        <span className="icon-chevron-heavy-left" />
      </Button>
      <Button
        className="carousel-controls carousel-controls-right"
        onClick={next}
        onMouseDown={onMouseDown}
        onBlur={handleButtonBlur}
        aria-label={translate(carouselTranslationMap.next)}
        data-testid="carousel-next-button"
      >
        <span className="icon-chevron-heavy-right" />
      </Button>
    </div>
  );
};

export default MediaCarouselScrollButtons;
