import React from "react";
import {
  renderSduiNestedChild,
  type SduiManagedChildList,
  type SduiRendererInjectedProps,
  type SduiResolvedAction,
} from "@rbx/sdui-core";

type SduiLazyNestedComponent = React.ReactNode | SduiManagedChildList;

type SduiGameTileHiddenStateProps = SduiRendererInjectedProps & {
  messageComponent?: React.ReactNode;
  undoButtonComponent?: SduiLazyNestedComponent;
  onUndoActivated?: SduiResolvedAction;
  feedbackButtonComponent?: SduiLazyNestedComponent;
  onFeedbackActivated?: SduiResolvedAction;
  /** Local prop from the hidden game tile. Drops the Give feedback button once feedback is sent. */
  isFeedbackSent?: boolean;
};

/**
 * Replaces a game tile's thumbnail after "Not interested": a message, an Undo
 * button, and an optional Give feedback button that goes away once feedback
 * is sent. The buttons are `LazyNestedComponentProp` SDUI buttons that receive
 * their actions through `extraLocalProps`.
 */
export function SduiGameTileHiddenState({
  messageComponent,
  undoButtonComponent,
  onUndoActivated,
  feedbackButtonComponent,
  onFeedbackActivated,
  isFeedbackSent = false,
}: SduiGameTileHiddenStateProps): React.JSX.Element {
  const undoButton =
    onUndoActivated != null
      ? renderSduiNestedChild(undoButtonComponent, { onActivated: onUndoActivated })
      : null;
  const feedbackButton =
    onFeedbackActivated != null && !isFeedbackSent
      ? renderSduiNestedChild(feedbackButtonComponent, { onActivated: onFeedbackActivated })
      : null;

  return (
    <div
      data-testid="sdui-game-tile-hidden-state"
      className="flex flex-col items-center justify-center gap-medium width-full height-full padding-medium radius-medium bg-surface-100"
      style={{ textAlign: "center" }}
    >
      {messageComponent}
      {undoButton}
      {feedbackButton}
    </div>
  );
}
