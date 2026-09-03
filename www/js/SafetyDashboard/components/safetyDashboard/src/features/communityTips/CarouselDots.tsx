interface CarouselDotsProps {
  itemCount: number;
  activeIndex: number;
}

/**
 * Indicator dots that show how many educational tips are available and which one is currently active.
 */
const CarouselDots = ({ itemCount, activeIndex }: CarouselDotsProps) => {
  if (itemCount <= 1) {
    return null;
  }

  return (
    <div
      className="flex flex-row items-center justify-center gap-small"
      data-testid="carousel-dots"
    >
      {Array.from({ length: itemCount }, (_, index) => (
        <span
          key={index}
          className={`${index === activeIndex ? "bg-system-contrast" : "bg-inverse-system-neutral"} size-[8px] transition-colors duration-100 radius-circle`}
          data-testid={`carousel-dot-${index}`}
        />
      ))}
    </div>
  );
};

export default CarouselDots;
