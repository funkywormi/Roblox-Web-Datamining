import { RefObject } from "react";

type OutsideEvent = CustomEvent<{ originalEvent: Event }>;

/**
 * Keeps a foundation Popover from dismissing when the interaction came from its own trigger.
 *
 * Radix's dismiss layer mounts with the content, so it catches the same pointer interaction that
 * opened the popover, and it catches the trigger's next mousedown too. It normally ignores both
 * because the target is the trigger, but inside a shadow root event.target is retargeted to the
 * host, so they read as outside clicks. composedPath() cannot recover the real target: the layer
 * runs after dispatch, when it returns an empty array. Both onPointerDownOutside and
 * onInteractOutside have to be vetoed; cancelling one does not cancel the other.
 *
 * Inert outside a shadow root, where getRootNode() is the document and there is no host.
 */
export const popoverDismissGuard = (container: RefObject<HTMLElement>) => {
  const isOwnTrigger = (event: OutsideEvent) => {
    const root = container.current?.getRootNode();
    const host = root instanceof ShadowRoot ? root.host : null;
    return host != null && event.detail.originalEvent.target === host;
  };

  const veto = (event: OutsideEvent) => {
    if (isOwnTrigger(event)) {
      event.preventDefault();
    }
  };

  return { onPointerDownOutside: veto, onInteractOutside: veto } as object;
};
