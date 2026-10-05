import { StoreData } from "./types";

export type State = {
  /** A random UUID for the run to help with analytics tracking*/
  runId: string;
  /** Represents the navigation stack. Each new node/screen is a new item in the stack.
   * [node-data-1, node-data-2, node-data-3, ...]
   * with the last item being the current node/screen.
   */
  stack: {
    nodeId: string;
    store: StoreData;
    enterTime: number; // timestamp when node was entered
  }[];
  /** Navigation between nodes */
  navigationState: "idle" | "gotoNext";
  /**
   * Abuse report submission state
   */
  submissionState: "idle" | "submitting" | "completed" | "failed";
  /**
   * Timestamp when the dialog was opened (equals initialEnterTime)
   */
  openTime: number;
};

export const getInitialState = ({
  runId,
  initialEnterTime,
  startNodeId,
}: {
  runId: string;
  initialEnterTime: number;
  /**
   * Node id that the flow begins on. Typically the resolved `startNode` from
   * the config (use `resolveStartNode` from `@rbx/abuse-report-config-types`).
   */
  startNodeId: string;
}): State => ({
  runId,
  stack: [
    {
      nodeId: startNodeId,
      store: {},
      enterTime: initialEnterTime,
    },
  ],
  navigationState: "idle",
  submissionState: "idle",
  openTime: initialEnterTime,
});

type Action =
  | {
      type: "gotoNode";
      payload: {
        nodeId: string;
        enterTime: number; // timestamp when entering the node
      };
    }
  | {
      /** Replace the current stack frame (Lua `goto.replace` semantics). Preserves frame store. */
      type: "replaceAndGotoNode";
      payload: {
        nodeId: string;
        enterTime: number;
      };
    }
  | {
      type: "goBack";
    }
  | {
      type: "updateDataAndNavigateNext";
      payload: {
        store: StoreData;
      };
    }
  | {
      type: "startedSubmission";
    }
  | {
      type: "reset";
      payload: {
        runId: string;
        initialEnterTime: number; // optional timestamp for initial state
        startNodeId: string; // resolved entry node for the new run
      };
    }
  | {
      type: "completedSubmission";
    }
  | {
      type: "submissionFailed";
    };

export const selectStore = (state: State): StoreData =>
  state.stack.reduce<StoreData>((acc, item) => ({ ...acc, ...item.store }), {});

/**
 * Reducer function that manages the state of the abuse report flow.
 */
export const reducer = (state: State, action: Action): State => {
  let nextState: State;
  switch (action.type) {
    case "gotoNode": {
      nextState = {
        ...state,
        navigationState: "idle",
        stack: [
          ...state.stack,
          {
            nodeId: action.payload.nodeId,
            store: {},
            enterTime: action.payload.enterTime,
          },
        ],
      };
      break;
    }
    case "replaceAndGotoNode": {
      const currentFrame = state.stack.at(-1);
      if (!currentFrame) {
        throw new Error("Stack is empty, cannot replace and go to node");
      }
      nextState = {
        ...state,
        navigationState: "idle",
        stack: [
          ...state.stack.slice(0, -1),
          {
            nodeId: action.payload.nodeId,
            store: currentFrame.store,
            enterTime: action.payload.enterTime,
          },
        ],
      };
      break;
    }
    case "goBack": {
      nextState = {
        ...state,
        stack: state.stack.slice(0, -1),
      };
      break;
    }
    case "updateDataAndNavigateNext": {
      const lastStackItem = state.stack.at(-1);
      if (!lastStackItem) {
        throw new Error("No last stack found");
      }
      const newStackItem = {
        ...lastStackItem,
        store: { ...lastStackItem.store, ...action.payload.store },
      };
      nextState = {
        ...state,
        stack: [...state.stack.slice(0, -1), newStackItem],
        navigationState: "gotoNext",
      };
      break;
    }
    case "startedSubmission": {
      nextState = {
        ...state,
        submissionState: "submitting",
      };
      break;
    }
    case "completedSubmission": {
      nextState = {
        ...state,
        submissionState: "completed",
      };
      break;
    }
    case "submissionFailed": {
      nextState = {
        ...state,
        submissionState: "failed",
      };
      break;
    }
    case "reset": {
      nextState = getInitialState({
        runId: action.payload.runId,
        initialEnterTime: action.payload.initialEnterTime,
        startNodeId: action.payload.startNodeId,
      });
      break;
    }
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unknown action type: ${(exhaustiveCheck as Action).type}`);
    }
  }

  return nextState;
};
