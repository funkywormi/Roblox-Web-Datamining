import { onAppDownloadClick, resolveAppDownload } from "@rbx/app-download";
import {
  clientOnly,
  readParam,
  type SduiActionContext,
  type SduiActionHandlerConfig,
} from "@rbx/sdui-core";

const resolveAppDownloadForAction = (
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
) =>
  resolveAppDownload({
    downloadTypeOverride: readParam(actionParams, "downloadType", "download_type"),
    translate: ctx.translate,
  });

export const downloadAppActionHandler: SduiActionHandlerConfig = {
  resolveHref: (actionParams, ctx) =>
    resolveAppDownloadForAction(actionParams, ctx)?.href.toString() ?? undefined,
  handler: clientOnly((actionConfig, _analyticsContext, ctx) => {
    const download = resolveAppDownloadForAction(actionConfig.actionParams, ctx);
    if (!download) {
      return;
    }

    onAppDownloadClick(download, {
      source: readParam(actionConfig.actionParams, "source"),
    });
  }),
};
