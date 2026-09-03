import { getCurrentOverlayedElement } from "./navigationState";
import { FOCUSABLE_SELECTORS, isElementFocusable } from "./elementUtils";
import { findFocusTrapContainer, detectActiveFocusTrap } from "./focusTrapUtils";

export function getAllFocusableElementsInRoot(root: HTMLElement): HTMLElement[] {
  const focusableElements = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
  return focusableElements.filter(isElementFocusable);
}

export function getAllFocusableElements(): HTMLElement[] {
  let searchRoot: HTMLElement | Document = document.documentElement;

  const currentElement =
    getCurrentOverlayedElement() ??
    (document.activeElement instanceof HTMLElement ? document.activeElement : null);

  if (currentElement) {
    const focusTrapContainer = findFocusTrapContainer(currentElement);
    if (focusTrapContainer) {
      searchRoot = focusTrapContainer;
    }
  } else {
    // No current element - check for active focus trap
    const activeFocusTrap = detectActiveFocusTrap();
    if (activeFocusTrap) {
      searchRoot = activeFocusTrap;
    }
  }

  return getAllFocusableElementsInRoot(searchRoot);
}
