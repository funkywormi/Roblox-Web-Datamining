import { Direction } from "./types";
import { getCurrentOverlayedElement } from "./navigationState";
import { findScrollableAncestor, scrollByDirection } from "./scrollUtils";
import { getElementViewportInfo } from "../viewportUtils";
import { FOCUSABLE_SELECTORS, isElementFocusable } from "./elementUtils";
import { detectActiveFocusTrap } from "./focusTrapUtils";
import { moveOverlayToTarget } from "./overlay";
import { getAllFocusableElements } from "./getAllFocusableElements";

const HIERARCHY_PENALTY_WEIGHT = 50;
const MAX_SCROLL_DISTANCE_RATIO = 1.5; // Max distance to scroll to an element (1.5x viewport)
const SECONDARY_DISTANCE_WEIGHT = 3;

// Calculates directionally-weighted distance with integrated cone filtering
function getWeightedDistance(r1: DOMRect, r2: DOMRect, direction: Direction): number {
  let primaryDistance: number;
  let secondaryDistance: number;

  switch (direction) {
    case "up": {
      primaryDistance = r1.top - r2.bottom;
      // Target must be above source
      if (primaryDistance < 0) return Infinity;
      secondaryDistance = Math.max(0, Math.max(r1.left - r2.right, r2.left - r1.right));
      break;
    }

    case "down": {
      primaryDistance = r2.top - r1.bottom;
      // Target must be below source
      if (primaryDistance < 0) return Infinity;
      secondaryDistance = Math.max(0, Math.max(r1.left - r2.right, r2.left - r1.right));
      break;
    }

    case "left": {
      // Target must be to the left of source
      primaryDistance = r1.left - r2.right;
      if (primaryDistance < 0) return Infinity;
      secondaryDistance = Math.max(0, Math.max(r1.top - r2.bottom, r2.top - r1.bottom));
      break;
    }

    case "right": {
      // Target must be to the right of source
      primaryDistance = r2.left - r1.right;
      if (primaryDistance < 0) return Infinity;
      secondaryDistance = Math.max(0, Math.max(r1.top - r2.bottom, r2.top - r1.bottom));
      break;
    }

    default:
      return Infinity;
  }

  return (
    primaryDistance * primaryDistance +
    secondaryDistance * secondaryDistance * SECONDARY_DISTANCE_WEIGHT
  );
}

// Scores a `targetRect` for navigation from a `currentRect` in a given `direction`.
// Lower scores are better.
function calculateNavigationScore(
  currentRect: DOMRect,
  targetRect: DOMRect,
  direction: Direction,
): number {
  // Calculate directionally-weighted distance (includes cone filtering)
  const weightedDistance = getWeightedDistance(currentRect, targetRect, direction);

  // Early exit if target is outside cone or wrong direction
  if (weightedDistance === Infinity) {
    return Infinity;
  }

  return weightedDistance;
}

function getElementDepth(el: HTMLElement | null): number {
  let depth = 0;
  let current = el;
  while (current && current !== document.documentElement) {
    current = current.parentElement;
    depth += 1;
  }
  // If current is null and we haven't reached documentElement, it means el wasn't in the main document.
  // Or if el was document.documentElement, depth is 0.
  return current === document.documentElement ? depth : Infinity;
}

function getCommonAncestor(el1: HTMLElement, el2: HTMLElement): HTMLElement {
  const path1: HTMLElement[] = [];
  let current: HTMLElement | null = el1;
  while (current) {
    path1.push(current);
    current = current.parentElement;
  }

  current = el2;
  while (current) {
    if (path1.includes(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.documentElement; // Fallback, should ideally always find one if both in doc
}

function calculateHierarchicalDistance(el1: HTMLElement, el2: HTMLElement): number {
  const commonAncestor = getCommonAncestor(el1, el2);

  const depth1 = getElementDepth(el1);
  const depth2 = getElementDepth(el2);
  const commonAncestorDepth = getElementDepth(commonAncestor);

  if (depth1 === Infinity || depth2 === Infinity || commonAncestorDepth === Infinity) {
    return Infinity; // One of the elements is not properly in the main DOM tree
  }

  return depth1 + depth2 - 2 * commonAncestorDepth;
}

export function findNextFocusableElement(
  currentElement: HTMLElement,
  direction: Direction,
): HTMLElement | null {
  const allCandidates = getAllFocusableElements().filter(el => el !== currentElement);

  if (allCandidates.length === 0) return null;

  // Calculate absolute positions in document coordinates
  let bestCandidate: HTMLElement | null = null;
  let minOverallScore = Infinity;

  for (const candidate of allCandidates) {
    const geometricScore = calculateNavigationScore(
      currentElement.getBoundingClientRect(),
      candidate.getBoundingClientRect(),
      direction,
    );

    if (geometricScore === Infinity) {
      continue;
    }

    const hierarchicalDistance = calculateHierarchicalDistance(currentElement, candidate);

    // If hierarchicalDistance is Infinity, this candidate is problematic (e.g., not in main DOM)
    if (hierarchicalDistance === Infinity) {
      continue;
    }

    const hierarchicalPenalty = hierarchicalDistance * HIERARCHY_PENALTY_WEIGHT;
    const overallScore = geometricScore + hierarchicalPenalty;

    if (overallScore < minOverallScore) {
      minOverallScore = overallScore;
      bestCandidate = candidate;
    }
  }

  return bestCandidate;
}

// Attempts to move focus in the given direction.
// Returns true if the focus was moved to a new element.
export function navigate(direction: Direction): boolean {
  try {
    const elementBeforeNavigation =
      // TODO: FIXME
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      getCurrentOverlayedElement() ?? (document.activeElement as HTMLElement | null);

    // Check for focus trap boundary violations
    const activeFocusTrap = detectActiveFocusTrap();
    if (
      activeFocusTrap &&
      elementBeforeNavigation &&
      !activeFocusTrap.contains(elementBeforeNavigation)
    ) {
      // Current element is outside focus trap - move to first element in trap
      const firstElementInTrap = activeFocusTrap.querySelector(FOCUSABLE_SELECTORS);
      if (firstElementInTrap instanceof HTMLElement && isElementFocusable(firstElementInTrap)) {
        moveOverlayToTarget(firstElementInTrap);
        return true;
      }
    }

    if (!elementBeforeNavigation || !isElementFocusable(elementBeforeNavigation)) {
      // If nothing is focused, focus the first focusable element.
      const firstFocusableElement = getAllFocusableElements()[0] ?? null;
      if (firstFocusableElement) {
        moveOverlayToTarget(firstFocusableElement);
        return true;
      }
      // There is nothing on the page that is focusable.
      return false;
    }

    const nextElement = findNextFocusableElement(elementBeforeNavigation, direction);

    // No next element found - simply scroll in that direction.
    if (!nextElement) {
      scrollByDirection(direction, elementBeforeNavigation);
      return false;
    }

    const nextRect = nextElement.getBoundingClientRect();
    const scrollContainer = findScrollableAncestor(nextElement);
    const containerRect =
      scrollContainer === document.body ? undefined : scrollContainer.getBoundingClientRect();
    const viewportInfo = getElementViewportInfo(nextRect, direction, containerRect);

    // Calculate how far the element is from viewport
    const viewportSize =
      direction === "up" || direction === "down"
        ? scrollContainer === document.body
          ? window.innerHeight
          : scrollContainer.clientHeight
        : scrollContainer === document.body
          ? window.innerWidth
          : scrollContainer.clientWidth;
    const maxScrollDistance = viewportSize * MAX_SCROLL_DISTANCE_RATIO;

    // Case 1: Element is in view and in inner zone - just focus it
    if (viewportInfo.inView && viewportInfo.inInnerZone) {
      moveOverlayToTarget(nextElement);
      return true;
    }

    // Case 2: Element is close by - scroll it into view.
    const isAtViewportEdge = viewportInfo.inView && !viewportInfo.inInnerZone;
    const isCloseToViewportEdge =
      !viewportInfo.inView && Math.abs(viewportInfo.distanceFromViewport) <= maxScrollDistance;
    if (isAtViewportEdge || isCloseToViewportEdge) {
      moveOverlayToTarget(nextElement);
      nextElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      return true;
    }

    // Case 3: Element is too far away - just scroll in that direction
    scrollByDirection(direction, elementBeforeNavigation);
    return false;
  } catch (error) {
    console.error("Failed to navigate", error);
    return false;
  }
}
