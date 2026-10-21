import { useEffect, type RefObject } from "react";

export default function useOnClickOutside(
  refs: RefObject<HTMLElement | null>[],
  handler: (event: TouchEvent | MouseEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: TouchEvent | MouseEvent) => {
      if (refs.every(ref => ref.current == null)) {
        return;
      }
      if (refs.some(ref => event.target instanceof Node && ref.current?.contains(event.target))) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [refs, handler]);
}
