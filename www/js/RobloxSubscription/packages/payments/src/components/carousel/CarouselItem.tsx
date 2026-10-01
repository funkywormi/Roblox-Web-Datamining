import classNames from "classnames";
import { ComponentProps, useContext, useRef, useEffect } from "react";
import { CarouselContext } from "./CarouselContext";

/** Module-level monotonic counter — React 17 has no `useId`, and item identity
 * only needs to be stable across re-renders within a single component instance. */
let itemIdCounter = 0;
function nextItemId(): string {
  itemIdCounter += 1;
  return `carousel-item-${String(itemIdCounter)}`;
}

export type CarouselItemProps = ComponentProps<"div">;

function CarouselItem({ className, children, ...rest }: CarouselItemProps) {
  const { registerItem } = useContext(CarouselContext);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef<string>("");
  if (idRef.current === "") {
    idRef.current = nextItemId();
  }

  useEffect(() => {
    const node = elementRef.current;
    if (node == null) {
      return undefined;
    }
    return registerItem(idRef.current, node);
  }, [registerItem]);

  return (
    <div
      ref={elementRef}
      className={classNames("carousel-item shrink-0", className)}
      // `scroll-snap-align` isn't a foundation-tailwind utility — set inline.
      style={{ scrollSnapAlign: "start" }}
      {...rest}
    >
      {children}
    </div>
  );
}

export { CarouselItem };
