import React, { useCallback } from "react";
import {
  SduiGameTile,
  type SduiGameTileOverflowMenuOpenChange,
  type SduiGameTileProps,
} from "@rbx/sdui-client";
import { useSduiServices } from "@rbx/sdui-core/client";
import {
  readPageSession,
  resolvePageContext,
  sendGameTileOverflowMenuOpenChange,
} from "../../actions/gameTileFeedbackHandlers";

/** The game tile with overflow menu open and close telemetry, as the app's tile logs it. */
export function SduiFeedbackGameTile(props: SduiGameTileProps): React.JSX.Element {
  const { analyticsContext } = props;
  const { pageContext } = useSduiServices();
  const onOverflowMenuOpenChange = useCallback(
    (event: SduiGameTileOverflowMenuOpenChange) => {
      const page = resolvePageContext(pageContext);
      sendGameTileOverflowMenuOpenChange(event, page, readPageSession(analyticsContext, page));
    },
    [analyticsContext, pageContext],
  );
  return <SduiGameTile {...props} onOverflowMenuOpenChange={onOverflowMenuOpenChange} />;
}
