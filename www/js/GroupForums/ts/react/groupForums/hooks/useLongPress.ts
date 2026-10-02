import { useCallback, useRef } from 'react';
import isEventOutsideCurrentTarget from '../../shared/utils/isEventOutsideCurrentTarget';

const LONG_PRESS_DURATION_MS = 500;

interface UseLongPressOptions {
  onLongPress: () => void;
}

interface UseLongPressResult {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  consumeLongPressClick: () => boolean;
}

const useLongPress = ({ onLongPress }: UseLongPressOptions): UseLongPressResult => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const isTouchPress = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Presses inside a portaled dialog belong to the dialog, not the element this hook is on.
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isEventOutsideCurrentTarget(e)) return;
      isTouchPress.current = e.pointerType === 'touch';
      if (e.pointerType !== 'touch') return;
      e.preventDefault();
      e.stopPropagation();
      didLongPress.current = false;
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        onLongPress();
      }, LONG_PRESS_DURATION_MS);
    },
    [onLongPress]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'touch' || isEventOutsideCurrentTarget(e)) return;
      e.preventDefault();
      e.stopPropagation();
      clear();
    },
    [clear]
  );

  // The release leaves a click behind that the pointer events cannot stop, and the caller sits
  // inside a link that would follow it.
  const consumeLongPressClick = useCallback(() => {
    if (!didLongPress.current) return false;
    didLongPress.current = false;
    return true;
  }, []);

  // A touch hold raises the platform menu, which competes with this gesture. A right click raises
  // the same event and carries the link actions, so it keeps them.
  const onContextMenu = useCallback((e: React.MouseEvent) => {
    if (isTouchPress.current && !isEventOutsideCurrentTarget(e)) e.preventDefault();
  }, []);

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave: clear,
    onContextMenu,
    consumeLongPressClick
  };
};

export default useLongPress;
