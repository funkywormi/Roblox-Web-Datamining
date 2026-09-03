import { isElementVisible } from "./elementUtils";

const FOCUS_TRAP_SELECTORS = ['[role="dialog"]'];

function isAncestorAriaHidden(element: Element) {
  let currentElement = element.parentElement;

  while (currentElement) {
    if (currentElement.getAttribute("aria-hidden") === "true") {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
}

export function findFocusTrapContainer(element: HTMLElement): HTMLElement | null {
  for (const selector of FOCUS_TRAP_SELECTORS) {
    const container = element.closest(selector);
    if (container && container instanceof HTMLElement && !container.hasAttribute("aria-hidden")) {
      return container;
    }
  }

  return null;
}

export function detectActiveFocusTrap(): HTMLElement | null {
  for (const selector of FOCUS_TRAP_SELECTORS) {
    const elements = Array.from(document.querySelectorAll(`${selector}:not([aria-hidden="true"])`));
    for (const element of elements) {
      if (isAncestorAriaHidden(element)) {
        continue;
      }

      if (element instanceof HTMLElement && isElementVisible(element)) {
        return element;
      }
    }
  }
  return null;
}
