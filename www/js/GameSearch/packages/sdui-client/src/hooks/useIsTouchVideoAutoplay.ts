import { useSignals } from "@preact/signals-react/runtime";
import { PreferredInput, ResponsiveStore } from "@rbx/sdui-core";
import { useClientOnlyValue } from "@rbx/sdui-core/client";

/**
 * Whether viewport autoplay applies to this browser.
 *
 * SSR assumes `Pointer`, but the browser store can already be `Touch` on the first
 * client render. This returns `false` until after mount, then subscribes. A later
 * pointer change moves tiles between viewport and hover playback.
 */
export function useIsTouchVideoAutoplay(): boolean {
  useSignals();
  const hasMounted = useClientOnlyValue(() => true, false);
  if (!hasMounted) {
    return false;
  }

  const { value } = ResponsiveStore.getInstance().getField("", ["preferredInput"]);
  return value === PreferredInput.Touch;
}
