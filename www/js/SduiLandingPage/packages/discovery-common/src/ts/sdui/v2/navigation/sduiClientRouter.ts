/**
 * client side navigation for SDUI action handlers.
 *
 * Handlers execute outside the React tree, so they cannot read a router from
 * context. An app registers its router here while mounted; registering asserts
 * that the router renders the paths SDUI handlers push. Surfaces that only need server side navigation
 * to a destination register nothing, and their handlers fall back to a full
 * document load.
 */
export type SduiClientRouter = {
  push: (routePath: string) => void;
};

let registeredRouter: SduiClientRouter | undefined;

/** Registers `router` for the mounted app and returns its unregister function. */
export function registerSduiClientRouter(router: SduiClientRouter): () => void {
  registeredRouter = router;

  return () => {
    if (registeredRouter === router) {
      registeredRouter = undefined;
    }
  };
}

/**
 * Pushes `routePath` onto the registered router. Returns false when no router is
 * registered, leaving the caller to navigate the document instead.
 */
export function pushSduiRoutePath(routePath: string): boolean {
  if (registeredRouter === undefined) {
    return false;
  }

  registeredRouter.push(routePath);
  return true;
}
