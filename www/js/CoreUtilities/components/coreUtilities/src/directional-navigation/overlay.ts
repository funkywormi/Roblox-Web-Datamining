import assert from "assert";
import { getCurrentOverlayedElement, setCurrentOverlayedElement } from "./navigationState";
import { findScrollableAncestor } from "./scrollUtils";
import { isElementFocusable } from "./elementUtils";
import { getAllFocusableElementsInRoot } from "./getAllFocusableElements";

export const OVERLAY_SPACING = 6; // px of space between element and overlay
const OVERLAY_ID = "spatial-nav-overlay"; // ID for the overlay element
const OVERLAY_BORDER_WIDTH = "var(--stroke-thicker)";
const OVERLAY_BORDER_COLOR = "var(--color-selection-start)";
const OVERLAY_BORDER_RADIUS = "var(--size-300)";
const MOVE_OVELAY_ON_FOCUSIN_DELAY_MS = 100;

class Overlay {
  private isVisible: boolean;

  private targetElement: HTMLElement | null;

  private container: HTMLElement | null;

  private readonly overlayElement: HTMLDivElement;

  private resizeTimeout: number | null = null;

  private currentScrollContainer: HTMLElement | null = null;

  constructor() {
    this.isVisible = false;
    this.targetElement = null;
    this.container = null;

    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (existingOverlay && existingOverlay instanceof HTMLDivElement) {
      this.overlayElement = existingOverlay;
      return;
    }
    this.overlayElement = document.createElement("div");
    this.overlayElement.id = OVERLAY_ID;
    Object.assign(this.overlayElement.style, {
      position: "absolute",
      display: "none",
      pointerEvents: "none",
      zIndex: "99999",
      border: `${OVERLAY_BORDER_WIDTH} solid ${OVERLAY_BORDER_COLOR}`,
      borderRadius: OVERLAY_BORDER_RADIUS,
    } satisfies Partial<CSSStyleDeclaration>);
    // Initially append to body, will be moved to appropriate container when needed
    document.body.appendChild(this.overlayElement);

    this.setupListeners();
  }

  hide = (): void => {
    this.removeScrollListener();
    this.updateState(false, null, null);
  };

  moveToTarget = (targetElement: HTMLElement): void => {
    const currentOverlayedElement = getCurrentOverlayedElement();
    if (currentOverlayedElement === targetElement) {
      return;
    }

    // Unblur whatever is currently browser-focused.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const targetContainer = findScrollableAncestor(targetElement);
    this.updateState(true, targetElement, targetContainer);
  };

  private render(): void {
    if (!this.isVisible || !this.targetElement || !this.container) {
      // Hide the overlay.
      this.overlayElement.style.display = "none";
      this.overlayElement.style.opacity = "0";

      // Moves overlay back to body.
      document.body.appendChild(this.overlayElement);

      // Clears the focused element.
      setCurrentOverlayedElement(null);
      return;
    }

    const targetRect = this.targetElement.getBoundingClientRect();
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    Object.assign(this.overlayElement.style, {
      top: `${targetRect.top + scrollTop - OVERLAY_SPACING}px`,
      left: `${targetRect.left + scrollLeft - OVERLAY_SPACING}px`,
      width: `${targetRect.width + OVERLAY_SPACING * 2}px`,
      height: `${targetRect.height + OVERLAY_SPACING * 2}px`,
      display: "block",
      opacity: "1",
    } satisfies Partial<CSSStyleDeclaration>);

    setCurrentOverlayedElement(this.targetElement);

    // Remove the outline from the target element.
    Object.assign(this.targetElement.style, {
      outline: "none",
    } satisfies Partial<CSSStyleDeclaration>);
  }

  private updateState(
    isVisible: boolean,
    targetElement: HTMLElement | null,
    targetContainer: HTMLElement | null,
  ): void {
    if (isVisible) {
      assert(targetElement, "Target element must be provided");
      assert(targetContainer, "Target container must be provided");
    }

    this.isVisible = isVisible;
    this.targetElement = targetElement;

    // If container changed, update scroll listeners
    if (this.container !== targetContainer) {
      this.removeScrollListener();
      this.container = targetContainer;
      this.addScrollListener();
    }

    this.render();
  }

  private setupListeners(): void {
    window.addEventListener("resize", this.handleResize.bind(this));
    document.addEventListener("mousedown", this.handleMouseDown.bind(this), true);
    document.addEventListener("focusin", this.handleFocusIn.bind(this), true);
  }

  private addScrollListener(): void {
    if (this.container && this.container !== this.currentScrollContainer) {
      this.removeScrollListener();

      if (this.container !== document.body) {
        this.container.addEventListener("scroll", this.handleScroll.bind(this));
      }
      this.currentScrollContainer = this.container;
    }
  }

  private removeScrollListener(): void {
    if (this.currentScrollContainer) {
      this.currentScrollContainer.removeEventListener("scroll", this.handleScroll.bind(this));
      this.currentScrollContainer = null;
    }
  }

  private handleScroll(): void {
    if (this.isVisible) {
      this.render();
    }
  }

  // Re-renders the overlay when the window is resized.
  private handleResize(): void {
    if (!this.isVisible) {
      return;
    }

    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = window.setTimeout(this.render.bind(this), 150);
  }

  // Hide overlay on mousedown.
  private handleMouseDown(): void {
    this.hide();
  }

  // Move overlay to the target (or the first focusable element inside it) when the focus is gained.
  private handleFocusIn(event: FocusEvent): void {
    if (!this.isVisible) {
      return;
    }

    const { target: eventTarget } = event;
    if (eventTarget instanceof HTMLElement) {
      let target: HTMLElement | undefined = eventTarget;
      if (!isElementFocusable(target)) {
        const focusableElements = getAllFocusableElementsInRoot(target);
        if (focusableElements.length > 0) {
          [target] = focusableElements;
        }
      }

      if (!target) {
        return;
      }

      // Gives the target time to settle before moving the overlay to it.
      setTimeout(() => {
        this.moveToTarget(target);
      }, MOVE_OVELAY_ON_FOCUSIN_DELAY_MS);
    }
  }
}

let overlay: Overlay | null = null;

export function setupOverlay(): void {
  overlay = overlay ?? new Overlay();
}

export function hideOverlay(): void {
  overlay?.hide();
}

export function moveOverlayToTarget(targetElement: HTMLElement): void {
  overlay?.moveToTarget(targetElement);
}
