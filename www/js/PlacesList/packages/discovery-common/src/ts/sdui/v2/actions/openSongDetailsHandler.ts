import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  type AnalyticsContext,
  type SduiActionContext,
} from "@rbx/sdui-core";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";

const OPEN_SONG_DETAIL_ACTION_TYPE = actionTypeName(ActionType.OPEN_SONG_DETAIL);

function reportMalformedSongId(ctx: SduiActionContext, message: string): undefined {
  ctx.errorReporter.reportSduiError(SduiErrorName.MalformedActionParam, message, ctx.pageContext, {
    actionType: OPEN_SONG_DETAIL_ACTION_TYPE,
    propName: "songId",
  });
  return undefined;
}

export function openSongDetailsResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  _analyticsContext?: AnalyticsContext,
): string | undefined {
  const rawSongId = actionParams.songId ?? actionParams.song_id;

  if (rawSongId === undefined) {
    return reportMalformedSongId(ctx, "Missing songId for OPEN_SONG_DETAIL resolveHref");
  }

  if (typeof rawSongId !== "string" && typeof rawSongId !== "number") {
    return reportMalformedSongId(
      ctx,
      `Invalid songId type=${typeof rawSongId} for OPEN_SONG_DETAIL resolveHref`,
    );
  }

  const songId = String(rawSongId);
  if (songId === "") {
    return reportMalformedSongId(ctx, "Empty songId for OPEN_SONG_DETAIL resolveHref");
  }

  return getAbsoluteUrl(`/music/${songId}`);
}
