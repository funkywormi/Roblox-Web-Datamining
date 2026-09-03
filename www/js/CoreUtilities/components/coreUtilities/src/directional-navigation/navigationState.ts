import { isElementVisible } from "./elementUtils";

let currentOverlayedElement: HTMLElement | null = null;

export function setCurrentOverlayedElement(element: HTMLElement | null): void {
  currentOverlayedElement = element;
}

export function getCurrentOverlayedElement(): HTMLElement | null {
  const isInDocument = currentOverlayedElement && document.body.contains(currentOverlayedElement);
  const isVisible = isElementVisible(currentOverlayedElement);
  return isInDocument && isVisible ? currentOverlayedElement : null;
}
