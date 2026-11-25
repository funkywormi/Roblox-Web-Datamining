import { sendEvent } from "@rbx/core-scripts/event-stream";
import { fireEvent } from "@rbx/www-common/event-tracker";
import {
  getHiddenGameTile,
  setGameTileFeedbackSent,
  setGameTileHidden,
  type SduiGameTileOverflowMenuOpenChange,
} from "@rbx/sdui-client";
import {
  findAnalyticsFieldInAncestors,
  readBooleanActionParam,
  readParam,
  readStringActionParam,
  type AnalyticsContext,
  type SduiActionContext,
  type SduiActionHandler,
  type SduiActionTelemetryHandler,
} from "@rbx/sdui-core";
import { userSignal } from "../../../common/constants/configConstants";
import eventStreamConstants, {
  EventStreamMetadata,
  GameTileHiddenActionType,
  GameTileOverflowMenuActionType,
  NotInterestedFeedbackFormActionType,
} from "../../../common/constants/eventStreamConstants";
import {
  sendNotInterestedFeedbackUserSignal,
  sendNotInterestedUserSignal,
} from "../../../common/components/userSignalUtils";
import { GameTileHiddenReason } from "../../../common/types/gameTileHiddenReason";
import { GameTileOverflowMenuItems } from "../../../common/types/gameTileOverflowMenuItems";
import { PageContext } from "../../../common/types/pageContext";
import { getSessionInfoTypeFromPageContext } from "../../../common/utils/parsingUtils";
import {
  openNotInterestedFeedbackForm,
  openWhyThisAdModal,
  type GameTileFeedbackRequest,
} from "../components/gameTileFeedback/gameTileFeedbackOverlays";
import { publishUserSignalError } from "../components/gameTileFeedback/userSignalErrorEvents";

export function toPageContext(page: string | undefined): PageContext | undefined {
  return Object.values(PageContext).find(value => value === page);
}

export function resolvePageContext(
  pageContext: { pageName?: string; appPage?: string } | undefined,
): PageContext | undefined {
  return toPageContext(pageContext?.pageName) ?? toPageContext(pageContext?.appPage);
}

/** The page's session field for event stream events, e.g. `homePageSessionInfo`. */
function pageSessionFields(
  page: PageContext | undefined,
  pageSession: string,
): Record<string, string> {
  const sessionInfoType = getSessionInfoTypeFromPageContext(page);
  return sessionInfoType && pageSession ? { [sessionInfoType]: pageSession } : {};
}

/** The page session id, which the page entry point adds to the root analytics data. */
export function readPageSession(
  analyticsContext: AnalyticsContext | undefined,
  page: PageContext | undefined,
): string {
  const sessionInfoType = getSessionInfoTypeFromPageContext(page);
  const session = sessionInfoType
    ? findAnalyticsFieldInAncestors(sessionInfoType, analyticsContext)
    : undefined;
  return typeof session === "string" ? session : "";
}

const TELEMETRY_FIELDS = [
  "universeId",
  "collectionId",
  "menuItemId",
  "availableMenuItemIds",
  "isDirectAction",
] as const;

/**
 * A telemetry field from the component's analytics data, its ancestors', or
 * the action params, in that order. Direct action buttons author their menu
 * item in analytics data; menu items get it as an action param.
 */
function readTelemetryField(
  name: string,
  actionParams: Record<string, unknown>,
  analyticsContext: AnalyticsContext | undefined,
): unknown {
  return findAnalyticsFieldInAncestors(name, analyticsContext) ?? actionParams[name];
}

function readAvailableMenuItems(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return typeof value === "string" && value !== "" ? value.split(",") : undefined;
}

function isMenuItem(value: unknown): value is GameTileOverflowMenuItems {
  return (
    typeof value === "string" &&
    (Object.values(GameTileOverflowMenuItems) as string[]).includes(value)
  );
}

/** Flips the tile back and shows the error toast when the signal fails, like the non-SDUI tile. */
function sendNotInterestedSignal(
  isNotInterested: boolean,
  universeId: string,
  collectionId: string,
  isSponsored: boolean,
  analyticsContext: AnalyticsContext,
  ctx: SduiActionContext,
  restoreFeedbackSent = false,
): void {
  const page = resolvePageContext(ctx.pageContext);
  sendNotInterestedUserSignal({
    universeId,
    topicId: collectionId,
    isSponsored,
    page,
    pageSession: readPageSession(analyticsContext, page),
    isNotInterested,
    onFailure: () => {
      setGameTileHidden(collectionId, universeId, !isNotInterested, isSponsored);
      if (!isNotInterested && restoreFeedbackSent) {
        setGameTileFeedbackSent(collectionId, universeId, true);
      }
      publishUserSignalError();
    },
  });
}

/** Bound ids arrive as strings or numbers depending on the hydration source. */
function readTileIds(actionParams: Record<string, unknown>): {
  universeId: string | undefined;
  collectionId: string | undefined;
} {
  return {
    universeId: readParam(actionParams, "universeId", "universe_id"),
    collectionId: readParam(actionParams, "collectionId", "collection_id"),
  };
}

/** "Not interested": hides the tile in its collection and records the user signal. */
export const setGameTileNotInterestedHandler: SduiActionHandler = (
  { actionParams },
  analyticsContext,
  ctx,
): void => {
  const { universeId, collectionId } = readTileIds(actionParams);
  if (!universeId || !collectionId) {
    fireEvent(userSignal.ExplicitFeedbackMissingTopicIdCounterEvent);
    return;
  }

  const isSponsored = readBooleanActionParam(actionParams, "isSponsored", false);
  setGameTileHidden(collectionId, universeId, true, isSponsored);
  sendNotInterestedSignal(true, universeId, collectionId, isSponsored, analyticsContext, ctx);
};

/** Undo on the hidden tile: restores it and clears the user signal. */
export const undoGameTileNotInterestedHandler: SduiActionHandler = (
  { actionParams },
  analyticsContext,
  ctx,
): void => {
  const { universeId, collectionId } = readTileIds(actionParams);
  if (!universeId || !collectionId) {
    fireEvent(userSignal.HiddenStateUndoFailedDueToMissingSetter);
    return;
  }

  const page = resolvePageContext(ctx.pageContext);
  sendEvent(
    ...eventStreamConstants.gameTileHiddenAction(
      {
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.SortId]: collectionId,
        [EventStreamMetadata.ActionType]: GameTileHiddenActionType.GameTileHiddenUndone,
        [EventStreamMetadata.HiddenReason]: GameTileHiddenReason.NotInterested,
        ...pageSessionFields(page, readPageSession(analyticsContext, page)),
      },
      page,
    ),
  );

  const previousHidden = getHiddenGameTile(collectionId, universeId);
  const isSponsored =
    previousHidden?.isSponsored ?? readBooleanActionParam(actionParams, "isSponsored", false);
  setGameTileHidden(collectionId, universeId, false);
  sendNotInterestedSignal(
    false,
    universeId,
    collectionId,
    isSponsored,
    analyticsContext,
    ctx,
    previousHidden?.isFeedbackSent ?? false,
  );
};

/** Feedback form open, close, and submit, in the event the non-SDUI hidden tile sends. */
function sendNotInterestedFeedbackFormAction(
  { universeId, collectionId }: GameTileFeedbackRequest,
  actionType: NotInterestedFeedbackFormActionType,
  page: PageContext | undefined,
  pageSession: string,
): void {
  sendEvent(
    ...eventStreamConstants.notInterestedFeedbackFormAction(
      {
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.SortId]: collectionId,
        [EventStreamMetadata.ActionType]: actionType,
        ...pageSessionFields(page, pageSession),
      },
      page,
    ),
  );
}

/**
 * Submits the feedback form's answers as a NotInterestedFeedback user signal.
 * The Give feedback button hides right away and comes back if the signal fails.
 */
function sendNotInterestedFeedbackSignal(
  { universeId, collectionId, isSponsored }: GameTileFeedbackRequest,
  selectedValues: { [key: string]: boolean },
  text: string,
  page: PageContext | undefined,
  pageSession: string,
): void {
  setGameTileFeedbackSent(collectionId, universeId, true);
  sendNotInterestedFeedbackUserSignal({
    universeId,
    topicId: collectionId,
    isSponsored,
    page,
    pageSession,
    selectedValues,
    text,
    onFailure: () => {
      setGameTileFeedbackSent(collectionId, universeId, false);
      publishUserSignalError();
    },
  });
}

/**
 * Give feedback on the hidden tile: opens the feedback form. Does nothing once
 * the tile is restored or its feedback was sent.
 */
export const openGameNotInterestedFeedbackHandler: SduiActionHandler = (
  { actionParams },
  analyticsContext,
  ctx,
): void => {
  const { universeId, collectionId } = readTileIds(actionParams);
  if (!universeId || !collectionId) {
    fireEvent(userSignal.ExplicitFeedbackMissingTopicIdCounterEvent);
    return;
  }
  const hiddenTile = getHiddenGameTile(collectionId, universeId);
  if (hiddenTile == null || hiddenTile.isFeedbackSent) {
    return;
  }
  const request = { universeId, collectionId, isSponsored: hiddenTile.isSponsored };
  const page = resolvePageContext(ctx.pageContext);
  const pageSession = readPageSession(analyticsContext, page);
  const sendActionEvent = (actionType: NotInterestedFeedbackFormActionType) =>
    sendNotInterestedFeedbackFormAction(request, actionType, page, pageSession);
  openNotInterestedFeedbackForm(ctx, request, {
    sendActionEvent,
    sendSignal: (selectedValues, text) =>
      sendNotInterestedFeedbackSignal(request, selectedValues, text, page, pageSession),
  });
};

export const openWhyThisAdHandler: SduiActionHandler = (
  { actionParams },
  _analyticsContext,
  ctx,
) => {
  const universeId = Number(readTileIds(actionParams).universeId);
  if (!Number.isFinite(universeId) || universeId <= 0) {
    return;
  }
  openWhyThisAdModal(ctx, {
    universeId,
    payerName: readStringActionParam(actionParams, "payerName", "") || undefined,
    sponsoredUserCohort:
      readStringActionParam(actionParams, "sponsoredUserCohort", "") || undefined,
  });
};

/**
 * Menu item and direct action activation, in the same event the non-SDUI game
 * tile menu sends.
 */
export const gameTileOverflowMenuTelemetryHandler: SduiActionTelemetryHandler = (
  { actionParams },
  analyticsContext,
  ctx,
): void => {
  const fields = Object.fromEntries(
    TELEMETRY_FIELDS.map(name => [name, readTelemetryField(name, actionParams, analyticsContext)]),
  );
  const universeId = readParam(fields, "universeId");
  const { menuItemId } = fields;
  const collectionId = readParam(fields, "collectionId");
  const isDirectAction = readParam(fields, "isDirectAction");
  if (!universeId || !isMenuItem(menuItemId)) {
    return;
  }

  const page = resolvePageContext(ctx.pageContext);
  sendEvent(
    ...eventStreamConstants.gameTileOverflowMenuAction(
      {
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.SortId]: collectionId === "" ? undefined : collectionId,
        [EventStreamMetadata.ActionType]:
          GameTileOverflowMenuActionType.GameTileOverflowMenuItemActivated,
        [EventStreamMetadata.MenuItem]: menuItemId,
        [EventStreamMetadata.AvailableMenuItems]: readAvailableMenuItems(
          fields.availableMenuItemIds,
        ),
        [EventStreamMetadata.IsDirectAction]:
          isDirectAction === undefined ? undefined : isDirectAction === "true",
        ...pageSessionFields(page, readPageSession(analyticsContext, page)),
      },
      page,
    ),
  );
};

/** Menu open and close, in the event the non-SDUI game tile menu sends. */
export function sendGameTileOverflowMenuOpenChange(
  { isOpen, universeId, collectionId, availableMenuItemIds }: SduiGameTileOverflowMenuOpenChange,
  page: PageContext | undefined,
  pageSession: string,
): void {
  sendEvent(
    ...eventStreamConstants.gameTileOverflowMenuAction(
      {
        [EventStreamMetadata.UniverseId]: universeId,
        [EventStreamMetadata.SortId]: collectionId,
        [EventStreamMetadata.ActionType]: isOpen
          ? GameTileOverflowMenuActionType.GameTileOverflowMenuItemOpened
          : GameTileOverflowMenuActionType.GameTileOverflowMenuItemClosed,
        [EventStreamMetadata.AvailableMenuItems]: availableMenuItemIds,
        ...pageSessionFields(page, pageSession),
      },
      page,
    ),
  );
}
