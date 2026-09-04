import { readStringActionParam } from "../../actions/readParam";
import { reportError, SduiErrorName } from "../../errors";
import type { SduiActionHandlerConfig } from "../../types";

/**
 * Loads the next page for the cache entry identified by `configKey`.
 *
 * Prefer the server-sent param so templates can target a specific surface.
 * Fall back to the rendered subtree's `ctx.configKey` when the template omits
 * it — web often builds cache keys on the client, so a missing or mismatched
 * server key would otherwise no-op in `loadMoreFromApi`.
 *
 * Web runtimes currently do not share one `ApiStore` across surfaces, so
 * `surfaceKey` is unused even when the template includes it.
 */
export const loadMoreFromApiHandler: NonNullable<SduiActionHandlerConfig["handler"]> = (
  actionConfig,
  _analyticsContext,
  ctx,
) => {
  const configKey = readStringActionParam(actionConfig.actionParams, "configKey", ctx.configKey);
  if (!configKey) {
    reportError(
      SduiErrorName.MalformedActionParam,
      "LOAD_MORE_FROM_API missing required configKey action param",
      ctx.pageContext,
      { name: "LOAD_MORE_FROM_API", propName: "configKey" },
      ctx.errorReporter,
    );
    return;
  }

  return ctx.apiStore.loadMoreFromApi(configKey);
};
