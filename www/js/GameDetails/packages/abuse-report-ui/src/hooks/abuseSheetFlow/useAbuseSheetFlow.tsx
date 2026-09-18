import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { resolveStartNode, type SubmissionTarget } from "@rbx/abuse-report-config-types";
import { RawConfig, StoreData, NextSimpleValue } from "./types";
import { getInitialState, reducer, selectStore, State } from "./reducer";
import { getNewRunId } from "../../util/runId";
import { ContentNode } from "./ContentNode";
import { resolveArConfig } from "../../util/resolver/configResolvers";
import {
  sendAnalyticsEvent,
  EventName,
  CommonAnalyticsProps,
  StatefulSendEvent,
  getApiErrorMessage,
  type SubmissionTargetTelemetry,
} from "../../analytics/analyticsService";
import { AbuseReportAnalytics } from "../../analytics/AbuseReportAnalyticsContext";
import {
  dispatchSubmission,
  SubmissionTargetDispatchError,
  type ClientActionRegistry,
} from "../../submission/dispatchSubmission";
import { getErrorMessage } from "../../util/errorMsg";

const getSubmissionTargetTelemetry = (target: SubmissionTarget): SubmissionTargetTelemetry => {
  switch (target.type) {
    case "default":
      return { target_type: target.type };
    case "clientAction":
      return {
        target_type: target.type,
        client_action_name: target.name,
      };
    default:
      return {};
  }
};

/**
 * Returns a sendEvent function that automatically adds common props to the event.
 */
const useAbuseSheetAnalytics = ({
  state,
  abuseVector,
  analyticsTargetId,
}: {
  state: State;
  abuseVector: string;
  analyticsTargetId?: string;
}) => {
  const sendEvent = useCallback<StatefulSendEvent>(
    (eventName, eventProps) => {
      const now = Date.now();
      const timeSinceOpen = state.openTime ? now - state.openTime : 0;
      const path = state.stack.map(item => item.nodeId);
      const stateProps: CommonAnalyticsProps = {
        run_id: state.runId,
        abuse_vector: abuseVector,
        total_duration: timeSinceOpen,
        path,
        ...(analyticsTargetId !== undefined ? { target_id: analyticsTargetId } : {}),
      };
      sendAnalyticsEvent(eventName, stateProps, eventProps);
    },
    [abuseVector, analyticsTargetId, state.stack, state.openTime, state.runId],
  );
  return { sendEvent, EventName };
};

/**
 * Utility to manage the state and output of the abuse report flow.
 * Expects to be used within a SheetRoot component.
 */
const useAbuseSheetFlow = (
  rawConfig: RawConfig,
  {
    onClose,
    open,
    abuseVector,
    analyticsTargetId,
    clientActions,
  }: {
    onClose: () => void;
    open?: boolean;
    abuseVector: string;
    analyticsTargetId?: string;
    clientActions?: ClientActionRegistry;
  },
) => {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const now = Date.now();
    const startNodeId = resolveStartNode(rawConfig, rawConfig.attributes);
    return getInitialState({ runId: getNewRunId(), initialEnterTime: now, startNodeId });
  });

  const store = useMemo(() => selectStore(state), [state]);
  const config = useMemo(() => {
    const config = resolveArConfig(rawConfig, store);
    return config;
  }, [rawConfig, store]);
  const firstRenderRef = useRef(true);

  const { sendEvent } = useAbuseSheetAnalytics({ state, abuseVector, analyticsTargetId });

  useEffect(() => {
    let { runId } = state;
    if (open && !firstRenderRef.current) {
      // Reset the state when the sheet is opened, excluding the first render
      // since the state is clean on the first render.
      runId = getNewRunId();
      const now = Date.now();
      const startNodeId = resolveStartNode(rawConfig, rawConfig.attributes);
      dispatch({ type: "reset", payload: { initialEnterTime: now, runId, startNodeId } });
    }
    firstRenderRef.current = false;

    if (open) {
      sendAnalyticsEvent(
        EventName.OpenDialog,
        {
          run_id: runId,
          abuse_vector: abuseVector,
          total_duration: 0,
          path: [],
          ...(analyticsTargetId !== undefined ? { target_id: analyticsTargetId } : {}),
        },
        {},
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset state on open
  }, [open]);

  const currentPage = state.stack.at(-1);

  if (!currentPage) {
    throw new Error("No current page found");
  }

  const currentNode = config.nodes[currentPage.nodeId];
  if (!currentNode) {
    throw new Error(`No node found for nodeId: ${currentPage.nodeId}`);
  }

  const handleClose = () => {
    onClose();
    if (state.submissionState !== "completed" && state.openTime) {
      sendEvent(EventName.EarlyClose, {});
    } else {
      sendEvent(EventName.Close, {});
    }
  };

  /**
   * Handle closing outside of the next action e.g. clicking the close button, overlay, pressing escape, etc.
   */
  const handleExternalClose = () => {
    sendEvent(EventName.NodeDone, {
      node_id: currentPage.nodeId,
      node_type: currentNode.type,
      node_duration: Date.now() - currentPage.enterTime,
      node_exit_reason: "back",
    });
    handleClose();
  };

  // When navigating to the next node, we need to handle two events:
  // 1. Update the store with new data
  // 2. Based on that derive the next node.
  //
  // However, since we (generally) don't know the next state after calling
  // dispatch (e.g. `dispatch(action)` returns void), we'll use a useEffect here
  // and trigger the navigation logic based on a state change instead (we have
  // the updated state) as opposed to the event itself (we'd have to manually
  // compute the next state).
  useEffect(() => {
    if (state.navigationState !== "gotoNext") {
      return;
    }
    const handleNextSimple = (next: NextSimpleValue) => {
      const now = Date.now();
      if (typeof next === "string") {
        dispatch({ type: "gotoNode", payload: { nodeId: next, enterTime: now } });
      } else if (next.type === "goto") {
        if (next.replace) {
          dispatch({
            type: "replaceAndGotoNode",
            payload: { nodeId: next.nodeId, enterTime: now },
          });
        } else {
          dispatch({ type: "gotoNode", payload: { nodeId: next.nodeId, enterTime: now } });
        }
      } else if (next.type === "link") {
        window.open(next.href, next.openInNewWindow ? "_blank" : "_self");
        handleClose();
      } else if (next.type === "reset") {
        const startNodeId = resolveStartNode(rawConfig, rawConfig.attributes);
        dispatch({
          type: "reset",
          payload: {
            runId: getNewRunId(),
            initialEnterTime: now,
            startNodeId,
          },
        });
      } else {
        // close (and any unknown simple next types)
        handleClose();
      }
    };

    const onSubmitForm = async () => {
      const { submission } = config;

      const { reportId } = await dispatchSubmission({
        target: submission.target,
        data: submission.data,
        clientActions,
      });
      return reportId;
    };

    const { next } = currentNode;
    if (typeof next !== "string" && next.type === "submitForm") {
      const submitStartTime = Date.now();
      const targetTelemetry = getSubmissionTargetTelemetry(config.submission.target);
      sendEvent(EventName.Submit, targetTelemetry);

      dispatch({ type: "startedSubmission" });
      onSubmitForm()
        .then(reportId => {
          dispatch({ type: "completedSubmission" });
          sendEvent(EventName.SubmitSuccess, {
            ...targetTelemetry,
            submit_api_duration: Date.now() - submitStartTime,
            ...(reportId === undefined ? {} : { report_id: reportId }),
          });
          handleNextSimple(next.onSuccess);
        })
        .catch((err: unknown) => {
          console.error("Error submitting report", err);
          dispatch({ type: "submissionFailed" });
          sendEvent(EventName.SubmitFail, {
            ...targetTelemetry,
            submit_api_duration: Date.now() - submitStartTime,
            ...(err instanceof SubmissionTargetDispatchError
              ? { target_failure_reason: err.reason }
              : {}),
          });
          sendEvent(EventName.Error, {
            error_message:
              config.submission.target.type === "clientAction"
                ? `Submission Error: Client action "${
                    config.submission.target.name
                  }" failed: ${getErrorMessage(err, "Unknown error")}`
                : getApiErrorMessage("submitReport", err, "Failed to submit report"),
          });
          if (next.onFailure) {
            handleNextSimple(next.onFailure);
          }
        });
    } else {
      handleNextSimple(next);
    }
    // We only want to react ONCE when the navigation state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.navigationState]);

  const canGoBack = state.stack.length > 1 && state.submissionState !== "completed";

  const goBack = () => {
    if (!canGoBack) return;
    const now = Date.now();
    dispatch({ type: "goBack" });
    sendEvent(EventName.NodeDone, {
      node_id: currentPage.nodeId,
      node_type: currentNode.type,
      node_duration: now - currentPage.enterTime,
      node_exit_reason: "back",
    });
  };

  const canGoNext = Boolean(currentNode.next);

  const onNext = (params?: { store?: StoreData }) => {
    const now = Date.now();
    dispatch({
      type: "updateDataAndNavigateNext",
      payload: {
        store: params?.store ?? {},
      },
    });
    sendEvent(EventName.NodeDone, {
      node_id: currentPage.nodeId,
      node_type: currentNode.type,
      node_duration: now - currentPage.enterTime,
      node_exit_reason: "next",
    });
  };

  const analytics: AbuseReportAnalytics = useMemo(() => ({ sendEvent, EventName }), [sendEvent]);

  return {
    config,
    canGoBack,
    goBack,
    isSubmitting: state.submissionState === "submitting",
    display: config.display,
    onClose: handleExternalClose,
    analytics,
    currentNode,
    currentPageElement: (
      <ContentNode
        // Include runId so `next: { type: "reset" }` remounts the start node and
        // clears local input state (comment text, list selection) even when nodeId is unchanged.
        key={`${state.runId}:${currentPage.nodeId}`}
        node={currentNode}
        onNext={canGoNext ? onNext : undefined}
        store={store}
        isSubmitting={state.submissionState === "submitting"}
      />
    ),
  };
};

export default useAbuseSheetFlow;
