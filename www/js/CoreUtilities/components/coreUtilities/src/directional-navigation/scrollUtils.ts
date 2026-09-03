import { findFocusTrapContainer } from "./focusTrapUtils";
import { Direction } from "./types";

const SMOOTH_SCROLL_DURATION_MS = 250;
const PAGE_SCROLL_AMOUNT_RATIO = 0.5; // How much to scroll when element is too far (50% of viewport)

function smoothScrollToPosition(target: HTMLElement | Window, x: number, y: number): void {
  // Clamp scroll positions to valid bounds
  const maxScrollX =
    target instanceof Window
      ? Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      : Math.max(0, target.scrollWidth - target.clientWidth);
  const maxScrollY =
    target instanceof Window
      ? Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      : Math.max(0, target.scrollHeight - target.clientHeight);
  const clampX = Math.max(0, Math.min(x, maxScrollX));
  const clampY = Math.max(0, Math.min(y, maxScrollY));

  new Promise<void>(resolve => {
    // Get current scroll position
    const startX = target instanceof Window ? window.scrollX : target.scrollLeft;
    const startY = target instanceof Window ? window.scrollY : target.scrollTop;

    const deltaX = clampX - startX;
    const deltaY = clampY - startY;
    if (deltaX === 0 && deltaY === 0) {
      resolve();
      return;
    }

    const startTime = performance.now();

    function animateScroll(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / SMOOTH_SCROLL_DURATION_MS, 1);

      // Easing function (ease-out)
      const easeOut = 1 - (1 - progress) ** 3;

      const currentX = startX + deltaX * easeOut;
      const currentY = startY + deltaY * easeOut;

      // Scroll using appropriate method
      if (target instanceof Window) {
        window.scrollTo(currentX, currentY);
      } else {
        target.scrollTo(currentX, currentY);
      }

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animateScroll);
  }).catch((error: unknown) => {
    console.warn("smoothScrollToPosition failed", error);
  });
}

export function findScrollableAncestor(element: HTMLElement): HTMLElement {
  let current = element.parentElement;

  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    const isScrollable =
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowX === "auto" ||
      style.overflowX === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll";

    if (isScrollable) {
      return current;
    }

    current = current.parentElement;
  }

  return document.body;
}

export function scrollByDirection(direction: Direction, fromElement?: HTMLElement): void {
  const scrollContainer = fromElement
    ? findScrollableAncestor(fromElement)
    : document.documentElement;
  const focusTrapContainer = fromElement ? findFocusTrapContainer(fromElement) : null;

  // If there is a focus trap, we need to check if the scroll container is within the focus trap.
  if (focusTrapContainer && !focusTrapContainer.contains(scrollContainer)) {
    // Scroll container is outside the focus trap - don't scroll
    return;
  }

  let containerWidth: number;
  let containerHeight: number;
  let currentScrollX: number;
  let currentScrollY: number;

  if (scrollContainer === document.body || scrollContainer === document.documentElement) {
    // Scrolling the main document
    containerWidth = window.innerWidth;
    containerHeight = window.innerHeight;
    currentScrollX = window.scrollX;
    currentScrollY = window.scrollY;
  } else {
    // Scrolling a specific container
    containerWidth = scrollContainer.clientWidth;
    containerHeight = scrollContainer.clientHeight;
    currentScrollX = scrollContainer.scrollLeft;
    currentScrollY = scrollContainer.scrollTop;
  }

  let deltaX = 0;
  let deltaY = 0;

  switch (direction) {
    case "up":
      deltaY = -containerHeight * PAGE_SCROLL_AMOUNT_RATIO;
      break;
    case "down":
      deltaY = containerHeight * PAGE_SCROLL_AMOUNT_RATIO;
      break;
    case "left":
      deltaX = -containerWidth * PAGE_SCROLL_AMOUNT_RATIO;
      break;
    case "right":
      deltaX = containerWidth * PAGE_SCROLL_AMOUNT_RATIO;
      break;
  }

  const targetX = currentScrollX + deltaX;
  const targetY = currentScrollY + deltaY;

  if (scrollContainer === document.body || scrollContainer === document.documentElement) {
    // Use window.scrollTo for main document
    smoothScrollToPosition(window, targetX, targetY);
  } else {
    // Use element.scrollTo for containers
    smoothScrollToPosition(scrollContainer, targetX, targetY);
  }
}
