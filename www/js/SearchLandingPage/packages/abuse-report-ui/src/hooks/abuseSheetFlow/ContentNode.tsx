import ConfirmationNode from "../../components/nodes/ConfirmationNode";
import ListNode from "../../components/nodes/ListNode";
import ParagraphNode from "../../components/nodes/ParagraphNode";
import CommentNode from "../../components/nodes/CommentNode";
import ReviewNode from "../../components/nodes/ReviewNode";
import type { ConfigValue } from "../../types";
import type { StoreData, AnyNode, NodeRendererProps, NodeRendererRegistry } from "./types";

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
  renderers?: NodeRendererRegistry;
};

/**
 * Render the current node based on the node type, along with some
 * glue logic to connect the value and data changing event handlers.
 *
 * A renderer registered for the node's type takes precedence over the built-in one.
 */
export const ContentNode = ({
  node,
  store,
  renderers,
  ...meta
}: ContentNodeProps): React.ReactElement => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the registry maps each type to a renderer for that same node type
  const Renderer = renderers?.[node.type] as React.ComponentType<NodeRendererProps> | undefined;
  if (Renderer) {
    return <Renderer node={node} store={store} {...meta} />;
  }

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
    case "review":
      return <ReviewNode {...node} {...meta} />;
    case "inExpChatSelection":
    case "inExpUserSelection":
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
