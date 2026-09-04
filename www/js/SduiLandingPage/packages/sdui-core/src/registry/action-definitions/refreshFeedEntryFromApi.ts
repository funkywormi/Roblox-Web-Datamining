import { readParam, readStringArrayParam } from "../../actions/readParam";
import { SduiErrorName } from "../../errors/SduiErrors";
import type { SduiActionHandlerConfig } from "../../types";

/**
 * Refreshes one keyed feed entry inside a mounted page entry.
 *
 * A selector overrides `selectedOptionIds` at invocation time, so the target
 * is derived per activation. The batch carries a single target: its request
 * identity is the page entry, the feed entry, and the selected options, which
 * lets the store cancel an older activation of the same selector while leaving
 * refreshes of other targets serialized.
 */
export const refreshFeedEntryFromApiHandler: NonNullable<
  SduiActionHandlerConfig["handler"]
> = async (actionConfig, _analyticsContext, ctx) => {
  const { actionParams } = actionConfig;
  const pageEntryIdentifier = readParam(
    actionParams,
    "pageEntryIdentifier",
    "page_entry_identifier",
  );
  const feedEntryIdentifier = readParam(
    actionParams,
    "feedEntryIdentifier",
    "feed_entry_identifier",
  );
  const selectedOptionIds = readStringArrayParam(
    actionParams,
    "selectedOptionIds",
    "selected_option_ids",
  );

  if (!ctx.configKey || !pageEntryIdentifier || !feedEntryIdentifier || !selectedOptionIds) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      "RefreshFeedEntryFromApi requires configKey, pageEntryIdentifier, feedEntryIdentifier, and selectedOptionIds",
      ctx.pageContext,
      { name: "RefreshFeedEntryFromApi" },
    );
    return;
  }

  await ctx.apiStore.refreshTargetFromApi(ctx.configKey, [
    {
      identifierPath: [pageEntryIdentifier, feedEntryIdentifier],
      requestParams: { selectedOptionIds },
    },
  ]);
};
