import { Direction } from "./directional-navigation/types";

const VIEWPORT_INNER_ZONE_RATIO = 0.8; // Inner 80% of viewport

interface ViewportZone {
  inView: boolean;
  inInnerZone: boolean;
  distanceFromViewport: number; // 0 if in view, positive if below/right, negative if above/left
}

export function getElementViewportInfo(
  rect: DOMRect,
  direction: Direction,
  viewportRect?: DOMRect,
): ViewportZone {
  const viewportWidth = viewportRect ? viewportRect.width : window.innerWidth;
  const viewportHeight = viewportRect ? viewportRect.height : window.innerHeight;
  const viewportLeft = viewportRect ? viewportRect.left : 0;
  const viewportTop = viewportRect ? viewportRect.top : 0;
  const viewportRight = viewportRect ? viewportRect.right : viewportWidth;
  const viewportBottom = viewportRect ? viewportRect.bottom : viewportHeight;

  // Calculate inner zone boundaries (center 80%)
  const horizontalMargin = (viewportWidth * (1 - VIEWPORT_INNER_ZONE_RATIO)) / 2;
  const verticalMargin = (viewportHeight * (1 - VIEWPORT_INNER_ZONE_RATIO)) / 2;

  const innerLeft = viewportLeft + horizontalMargin;
  const innerRight = viewportRight - horizontalMargin;
  const innerTop = viewportTop + verticalMargin;
  const innerBottom = viewportBottom - verticalMargin;

  // Check if element is in viewport
  const inView =
    rect.right >= viewportLeft &&
    rect.left <= viewportRight &&
    rect.bottom >= viewportTop &&
    rect.top <= viewportBottom;

  // Check if element is in inner zone
  const inInnerZone =
    inView &&
    rect.left >= innerLeft &&
    rect.right <= innerRight &&
    rect.top >= innerTop &&
    rect.bottom <= innerBottom;

  // Calculate distance from viewport edge
  let distanceFromViewport = 0;
  if (!inView) {
    switch (direction) {
      case "up":
        distanceFromViewport = rect.bottom < viewportTop ? rect.bottom - viewportTop : 0;
        break;
      case "down":
        distanceFromViewport = rect.top > viewportBottom ? rect.top - viewportBottom : 0;
        break;
      case "left":
        distanceFromViewport = rect.right < viewportLeft ? rect.right - viewportLeft : 0;
        break;
      case "right":
        distanceFromViewport = rect.left > viewportRight ? rect.left - viewportRight : 0;
        break;
    }
  }

  return { inView, inInnerZone, distanceFromViewport };
}
