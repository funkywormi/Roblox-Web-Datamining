/**
 * Generic horizontal carousel primitive.
 *
 * Usage:
 *
 *   <Carousel ariaLabel="Subscription tiers">
 *     <Carousel.PrevButton ariaLabel="Previous tier" className="hidden small:flex" />
 *     <Carousel.Track>
 *       {items.map(it => (
 *         <Carousel.Item key={it.id}>...</Carousel.Item>
 *       ))}
 *     </Carousel.Track>
 *     <Carousel.NextButton ariaLabel="Next tier" className="hidden small:flex" />
 *     <Carousel.Indicator />
 *   </Carousel>
 *
 * Arrows and the dots indicator both auto-hide when the carousel can't scroll
 * (single page / all items visible). Consumers can layer responsive utility
 * classes on top of `Carousel.Prev/NextButton` to gate them per-breakpoint.
 */

import { Carousel as CarouselRoot, CarouselTrack } from "./Carousel";
import { CarouselItem } from "./CarouselItem";
import { CarouselPrevButton, CarouselNextButton } from "./CarouselNavButtons";
import { CarouselIndicator } from "./CarouselIndicator";

/**
 * Compound export — `Object.assign` widens the function type with the static
 * sub-components, so callers can write `<Carousel.Track>` without us reaching
 * for an unsafe `as` cast on the function itself.
 */
const Carousel = Object.assign(CarouselRoot, {
  Track: CarouselTrack,
  Item: CarouselItem,
  PrevButton: CarouselPrevButton,
  NextButton: CarouselNextButton,
  Indicator: CarouselIndicator,
});

export { Carousel };
export type { CarouselRootProps, CarouselTrackProps } from "./Carousel";
export type { CarouselItemProps } from "./CarouselItem";
export type { CarouselNavButtonProps } from "./CarouselNavButtons";
export type { CarouselIndicatorProps } from "./CarouselIndicator";
