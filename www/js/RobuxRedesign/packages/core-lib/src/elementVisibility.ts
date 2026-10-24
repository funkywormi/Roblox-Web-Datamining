import { window } from "./browser";

export type TVisibilityCallback = (visible: boolean) => void;

export type TObserveVisibilityOptions = IntersectionObserverInit & {
  element: Element;
};

export type TObserveIntersectionOptions = IntersectionObserverInit & {
  elements: Element[];
};

/**
 * Observes an element's visibility and returns a function that disconnects the observer.
 * Returns a no-op when IntersectionObserver is unavailable, including during SSR.
 * In React, call this from an effect after the element mounts and return the cleanup function.
 */
export const observeVisibility = (
  options: TObserveVisibilityOptions,
  callback: TVisibilityCallback,
): VoidFunction => {
  const Observer = window?.IntersectionObserver;
  if (typeof Observer !== "function") {
    return () => undefined;
  }

  const { element, ...observerOptions } = options;
  try {
    const intersectionObserver = new Observer(([entry]: IntersectionObserverEntry[]) => {
      callback(entry?.isIntersecting ?? false);
    }, observerOptions);

    intersectionObserver.observe(element);
    return () => {
      intersectionObserver.disconnect();
    };
  } catch {
    // Preserve the legacy no-op fallback if observer construction or observation fails.
  }

  return () => undefined;
};

/**
 * Observes multiple elements and returns a function that disconnects the observer.
 * Returns a no-op when IntersectionObserver is unavailable, including during SSR.
 * In React, call this from an effect after the elements mount and return the cleanup function.
 */
export const observeIntersection = (
  options: TObserveIntersectionOptions,
  callback: IntersectionObserverCallback,
): VoidFunction => {
  const Observer = window?.IntersectionObserver;
  if (typeof Observer !== "function") {
    return () => undefined;
  }

  const { elements, ...observerOptions } = options;
  try {
    const intersectionObserver = new Observer(callback, observerOptions);

    for (const el of elements) {
      intersectionObserver.observe(el);
    }
    return () => {
      intersectionObserver.disconnect();
    };
  } catch {
    // Preserve the legacy no-op fallback if observer construction or observation fails.
  }

  return () => undefined;
};
