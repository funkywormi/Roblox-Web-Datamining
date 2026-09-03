import ConfirmationNode from "../../components/nodes/ConfirmationNode";
import ListNode from "../../components/nodes/ListNode";
import ParagraphNode from "../../components/nodes/ParagraphNode";
import CommentNode from "../../components/nodes/CommentNode";
import DevNode from "../../components/nodes/DevNode";
import DevListNode from "../../components/nodes/DevListNode";
import ReviewNode from "../../components/nodes/ReviewNode";
import type { ConfigValue } from "../../types";
import { StoreData, AnyNode } from "./types";

const getStoredItemId = (value: ConfigValue): string | undefined => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const { id } = value;
    if (typeof id === "string" || typeof id === "number" || typeof id === "boolean") {
      return String(id);
    }
  }
  return undefined;
};

type StoreUpdate = {
  store?: StoreData;
};

type ContentNodeProps = {
  node: AnyNode;
  store: StoreData;
  onNext?: (params?: StoreUpdate) => void;
  isSubmitting?: boolean;
};

/**
 * Render the current node based on the node type, along with some
 * glue logic to connect the value and data changing event handlers.
 */
export const ContentNode = ({ node, store, ...meta }: ContentNodeProps): React.ReactElement => {
  switch (node.type) {
    case "list": {
      const initialValue = getStoredItemId(store[node.storeAs]);
      return (
        <ListNode
          {...node}
          {...meta}
          initialValue={initialValue}
          onNext={({ selectionItem }) => {
            meta.onNext?.({ store: { [node.storeAs]: selectionItem } });
          }}
        />
      );
    }
    case "comment": {
      const rawValue = store[node.storeAs];
      const initialValue = typeof rawValue === "string" ? rawValue : undefined;
      return (
        <CommentNode
          {...node}
          {...meta}
          initialValue={initialValue}
          onNext={userNote => {
            meta.onNext?.({
              store: {
                [node.storeAs]: userNote,
              },
            });
          }}
        />
      );
    }
    case "confirmation":
      return <ConfirmationNode {...node} {...meta} />;
    case "paragraph":
      return <ParagraphNode {...node} {...meta} />;
    case "devNode":
      return <DevNode {...node} {...meta} />;
    case "review":
      return <ReviewNode {...node} {...meta} />;
    case "devList": {
      const initialValue = getStoredItemId(store[node.storeAs]);
      return (
        <DevListNode
          {...node}
          {...meta}
          initialValue={initialValue}
          onNext={({ selectionItem }) => {
            meta.onNext?.({ store: { [node.storeAs]: selectionItem } });
          }}
        />
      );
    }
    case "inExpChatSelection":
    case "inExpSceneSelection":
    case "inExpConfirmation":
      throw new Error(`Node type "${node.type}" is not supported on web`);
    default: {
      // Exhaustive check
      const exhaustiveCheck: never = node;
      throw new Error(`Unknown step type: ${(exhaustiveCheck as AnyNode).type}`);
    }
  }
};
