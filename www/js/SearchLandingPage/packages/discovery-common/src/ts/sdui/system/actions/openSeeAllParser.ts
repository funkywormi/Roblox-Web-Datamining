import { TSduiActionConfig, TSduiParsedActionConfig } from "../SduiActionParserRegistry";
import { TAnalyticsContext, TSduiContext } from "../SduiTypes";
import logSduiError, { SduiErrorNames } from "../../utils/logSduiError";
import { buildSortDetailUrl } from "../../../common/utils/browserUtils";
import {
  EventStreamMetadata,
  TSortDetailReferral,
} from "../../../common/constants/eventStreamConstants";
import { PageContext } from "../../../common/types/pageContext";
import {
  buildSessionAnalyticsData,
  findAnalyticsFieldInAncestors,
  getSessionInfoKey,
  parseMaybeStringNumberField,
  parseStringField,
} from "../../utils/analyticsParsingUtils";

/**
 * Build buildSortDetailReferral event params for compatability with existing pipelines.
 *
 * These params will be attached to the URL params of the resulting see all page.
 */
const buildSortDetailReferralParams = (
  analyticsContext: TAnalyticsContext,
  collectionId: number,
  sduiContext: TSduiContext,
): TSortDetailReferral => {
  const collectionPosition = parseMaybeStringNumberField(
    findAnalyticsFieldInAncestors("collectionPosition", analyticsContext, -1),
    -1,
  );

  const pageSessionInfo = parseStringField(
    findAnalyticsFieldInAncestors(
      getSessionInfoKey(sduiContext.pageContext) ?? "",
      analyticsContext,
      "",
    ),
    "",
  );

  // TODO https://roblox.atlassian.net/browse/ADS-8012
  // Check if we need a componentType field for this event.
  return {
    [EventStreamMetadata.Position]: collectionPosition,
    [EventStreamMetadata.SortId]: collectionId,
    [EventStreamMetadata.GameSetTypeId]: collectionId,
    [EventStreamMetadata.Page]: sduiContext.pageContext.pageName as
      | PageContext.HomePage
      | PageContext.GamesPage,
    ...buildSessionAnalyticsData(pageSessionInfo, sduiContext.pageContext),
  };
};

const openSeeAllParser = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
): TSduiParsedActionConfig => {
  const collectionName = actionConfig.actionParams?.collectionName;
  const parsedCollectionName = parseStringField(collectionName as string, "");
  if (!parsedCollectionName) {
    logSduiError(
      SduiErrorNames.SduiActionOpenSeeAllInvalidCollectionName,
      `Invalid collection name ${JSON.stringify(collectionName)} to open see all`,
      sduiContext.pageContext,
    );

    return {
      callback: undefined,
      linkPath: undefined,
    };
  }

  const collectionId = actionConfig.actionParams?.collectionId;
  const parsedCollectionId = parseMaybeStringNumberField(collectionId as number, -1);
  if (!parsedCollectionId || parsedCollectionId === -1) {
    logSduiError(
      SduiErrorNames.SduiActionOpenSeeAllInvalidCollectionId,
      `Invalid collection id ${JSON.stringify(collectionId)} to open see all`,
      sduiContext.pageContext,
    );

    return {
      callback: undefined,
      linkPath: undefined,
    };
  }

  const referralParams = buildSortDetailReferralParams(
    analyticsContext,
    parsedCollectionId,
    sduiContext,
  );
  const seeAllLink = buildSortDetailUrl(
    parsedCollectionName,
    referralParams[EventStreamMetadata.Page],
    referralParams,
  );

  // TODO https://roblox.atlassian.net/browse/ADS-8012
  // Check the sortDetailReferral and itemAction params after response is merged for testing.
  return {
    callback: undefined,
    linkPath: seeAllLink,
  };
};

export default openSeeAllParser;
