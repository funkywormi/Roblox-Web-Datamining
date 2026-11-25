import React, { useCallback, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { enqueueDialog, type DialogRenderContext } from "@rbx/prompts-orchestrator";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { setGameTileFeedbackSent, useHiddenGameTile } from "@rbx/sdui-client";
import { SduiErrorName, type SduiActionContext } from "@rbx/sdui-core";
import NotInterestedFeedbackForm from "../../../../common/components/NotInterestedFeedbackForm";
import WhyThisAdModal from "../../../../common/components/WhyThisAdModal";
import { NotInterestedFeedbackFormActionType } from "../../../../common/constants/eventStreamConstants";

export type GameTileFeedbackRequest = {
  universeId: string;
  collectionId: string;
  isSponsored: boolean;
};

type GameTileWhyThisAdRequest = {
  universeId: number;
  payerName?: string;
  sponsoredUserCohort?: string;
};

export type NotInterestedFeedbackFormCallbacks = {
  sendActionEvent: (actionType: NotInterestedFeedbackFormActionType) => void;
  sendSignal: (selectedValues: { [key: string]: boolean }, text: string) => void;
};

/** Queues a dialog on the prompts orchestrator, which shows one overlay at a time. */
function submitDialog(
  dedupeKey: string,
  render: (context: DialogRenderContext) => React.ReactNode,
): void {
  enqueueDialog({
    id: generateRandomUuid(),
    dedupeKey,
    triggerType: "action",
    renderer: "custom-render-dialog",
    payload: { render },
  });
}

/** The overlays show page strings, so they need the page's translate function. */
function readTranslate(ctx: SduiActionContext, overlay: string): TranslateFunction | undefined {
  if (ctx.translate == null) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.FailedToExecuteAction,
      `Cannot open ${overlay} without a translate function in the SDUI services`,
      ctx.pageContext,
    );
  }
  return ctx.translate;
}

function FeedbackFormOverlay({
  request,
  callbacks,
  translate,
  close,
}: {
  request: GameTileFeedbackRequest;
  callbacks: NotInterestedFeedbackFormCallbacks;
  translate: TranslateFunction;
  close: () => void;
}): React.JSX.Element | null {
  const { collectionId, universeId } = request;
  const isTileHidden = useHiddenGameTile(collectionId, universeId) != null;
  const { sendActionEvent } = callbacks;
  const hasLoggedOpenRef = useRef(false);

  useEffect(() => {
    if (!isTileHidden) {
      close();
      return;
    }
    if (!hasLoggedOpenRef.current) {
      hasLoggedOpenRef.current = true;
      sendActionEvent(NotInterestedFeedbackFormActionType.NotInterestedFeedbackFormOpened);
    }
  }, [isTileHidden, close, sendActionEvent]);

  const onClose = useCallback(
    (isCloseFromSubmit?: boolean) => {
      if (!isCloseFromSubmit) {
        sendActionEvent(
          NotInterestedFeedbackFormActionType.NotInterestedFeedbackFormClosedWithoutSubmit,
        );
      }
      close();
    },
    [sendActionEvent, close],
  );
  const setShowGiveFeedbackButton = useCallback(
    (show: boolean) => setGameTileFeedbackSent(collectionId, universeId, !show),
    [collectionId, universeId],
  );

  if (!isTileHidden) {
    return null;
  }

  return (
    <NotInterestedFeedbackForm
      open
      onClose={onClose}
      sendActionEvent={sendActionEvent}
      sendSignal={callbacks.sendSignal}
      setShowGiveFeedbackButton={setShowGiveFeedbackButton}
      translate={translate}
    />
  );
}

/** Opens the Not Interested feedback form. It closes on its own if the tile is restored. */
export function openNotInterestedFeedbackForm(
  ctx: SduiActionContext,
  request: GameTileFeedbackRequest,
  callbacks: NotInterestedFeedbackFormCallbacks,
): void {
  const translate = readTranslate(ctx, "the Not Interested feedback form");
  if (translate == null) {
    return;
  }
  submitDialog(
    `gameTileNotInterestedFeedbackForm:${request.collectionId}:${request.universeId}`,
    ({ onClose }) => (
      <FeedbackFormOverlay
        request={request}
        callbacks={callbacks}
        translate={translate}
        close={onClose}
      />
    ),
  );
}

let whyThisAdQueryClient: QueryClient | undefined;

// OverlayOrchestrator mounts in its own React root without a QueryClientProvider,
// and WhyThisAdModal queries game details through @tanstack/react-query.
// Match core-scripts' shared queryClient defaults so returning from the Ads Preferences
// tab does not refetch and flash the loading spinner, and failed queries do not retry.
function getWhyThisAdQueryClient(): QueryClient {
  whyThisAdQueryClient ??= new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  return whyThisAdQueryClient;
}

export function openWhyThisAdModal(
  ctx: SduiActionContext,
  request: GameTileWhyThisAdRequest,
): void {
  const translate = readTranslate(ctx, "the Why this ad modal");
  if (translate == null) {
    return;
  }
  submitDialog(`gameTileWhyThisAd:${request.universeId}`, ({ onClose }) => (
    <QueryClientProvider client={getWhyThisAdQueryClient()}>
      <WhyThisAdModal
        open
        onClose={() => onClose({ reason: "dismissed" })}
        universeId={request.universeId}
        payerName={request.payerName}
        sponsoredUserCohort={request.sponsoredUserCohort}
        translate={translate}
      />
    </QueryClientProvider>
  ));
}
