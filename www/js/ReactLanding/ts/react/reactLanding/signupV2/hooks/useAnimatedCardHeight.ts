import { RefObject, useLayoutEffect, useRef } from 'react';
import { signupV2CardResizingClassName } from '../constants/signupV2Styles';

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';
const heightTolerance = 0.5;

const toPixels = (value: string): number => Number.parseFloat(value) || 0;

const getVerticalChrome = (element: HTMLElement): number => {
  const style = window.getComputedStyle(element);
  return (
    toPixels(style.paddingTop) +
    toPixels(style.paddingBottom) +
    toPixels(style.borderTopWidth) +
    toPixels(style.borderBottomWidth)
  );
};

const useAnimatedCardHeight = (
  cardRef: RefObject<HTMLElement>,
  activeContentRef: RefObject<HTMLElement>,
  minimumContentRef?: RefObject<HTMLElement>
): void => {
  const hasMeasuredRef = useRef(false);
  const targetHeightRef = useRef(0);
  const animationFrameRef = useRef<number>();

  useLayoutEffect(() => {
    const card = cardRef.current;
    const activeContent = activeContentRef.current;
    const minimumContent = minimumContentRef?.current;
    if (!card || !activeContent) {
      return undefined;
    }

    const motionPreference =
      typeof window.matchMedia === 'function' ? window.matchMedia(reducedMotionQuery) : undefined;

    const cancelPendingFrame = (): void => {
      if (animationFrameRef.current !== undefined) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };

    const finishAnimation = (): void => {
      cancelPendingFrame();
      card.classList.remove(signupV2CardResizingClassName);
    };

    const setHeight = (nextHeight: number): void => {
      if (nextHeight <= 0) {
        return;
      }

      const shouldReduceMotion = motionPreference?.matches ?? false;
      if (!hasMeasuredRef.current || shouldReduceMotion) {
        finishAnimation();
        card.style.height = `${nextHeight}px`;
        hasMeasuredRef.current = true;
        targetHeightRef.current = nextHeight;
        return;
      }

      if (Math.abs(nextHeight - targetHeightRef.current) < heightTolerance) {
        return;
      }

      cancelPendingFrame();

      // Freeze an interrupted transition at its rendered height before assigning the new
      // destination. This prevents rapid validation changes from snapping to an old target.
      const renderedHeight = card.getBoundingClientRect().height || targetHeightRef.current;
      card.classList.remove(signupV2CardResizingClassName);
      card.style.height = `${renderedHeight}px`;
      // Flush the frozen height before restoring the transition.
      card.getBoundingClientRect();

      targetHeightRef.current = nextHeight;
      card.classList.add(signupV2CardResizingClassName);
      animationFrameRef.current = window.requestAnimationFrame(() => {
        card.style.height = `${nextHeight}px`;
        animationFrameRef.current = undefined;
      });
    };

    const measure = (): void => {
      const contentHeight = Math.max(
        activeContent.getBoundingClientRect().height,
        minimumContent?.getBoundingClientRect().height ?? 0
      );
      setHeight(contentHeight + getVerticalChrome(card));
    };

    const handleTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === card && event.propertyName === 'height') {
        finishAnimation();
      }
    };

    const handleMotionPreferenceChange = (): void => {
      if (motionPreference?.matches) {
        setHeight(targetHeightRef.current);
      }
    };

    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(activeContent);
    if (minimumContent && minimumContent !== activeContent) {
      observer?.observe(minimumContent);
    }
    card.addEventListener('transitionend', handleTransitionEnd);

    if (motionPreference) {
      if (typeof motionPreference.addEventListener === 'function') {
        motionPreference.addEventListener('change', handleMotionPreferenceChange);
      } else {
        motionPreference.addListener(handleMotionPreferenceChange);
      }
    }

    return () => {
      observer?.disconnect();
      const renderedHeight = card.getBoundingClientRect().height;
      const wasAnimating = card.classList.contains(signupV2CardResizingClassName);
      finishAnimation();
      if (wasAnimating && renderedHeight > 0) {
        card.style.height = `${renderedHeight}px`;
        targetHeightRef.current = renderedHeight;
      }
      card.removeEventListener('transitionend', handleTransitionEnd);
      if (motionPreference) {
        if (typeof motionPreference.removeEventListener === 'function') {
          motionPreference.removeEventListener('change', handleMotionPreferenceChange);
        } else {
          motionPreference.removeListener(handleMotionPreferenceChange);
        }
      }
    };
  }, [activeContentRef, cardRef, minimumContentRef]);
};

export default useAnimatedCardHeight;
