import { useRef } from "react";

import type { FlowNode, NodeComponent } from "../types";

export type PresentedOverPage = { node: FlowNode; Component: NodeComponent };

/**
 * The full-page node to keep on screen while the current node presents over it. Only nodes that
 * draw their own surface (`ownsOverlay`) qualify; anything else is replaced as usual.
 */
export function usePresentedOverPage(
  node: FlowNode | undefined,
  Component: NodeComponent | undefined,
): PresentedOverPage | undefined {
  const lastPageRef = useRef<PresentedOverPage | undefined>(undefined);
  if (node == null || Component == null) {
    return undefined;
  }
  if (node.behavior?.presentsOverPrevious !== true) {
    // Idempotent for a given node, so safe to record during render.
    lastPageRef.current = Component.ownsOverlay === true ? { node, Component } : undefined;
    return undefined;
  }
  return lastPageRef.current;
}
