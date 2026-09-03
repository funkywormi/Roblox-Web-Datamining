import React from "react";
import { render } from "react-dom";
import { NotificationLocalizationProvider } from "../../sendrNotificationStream/context/NotificationsLocalization";
import GameUpdateNotification from "./GameUpdateNotification";
import { GameUpdateHandlers, GameUpdateViewModel } from "./types";

// Unlike group/PM (which read a serialized notification off an attribute), game-update
// content isn't in the notification: Angular resolves the gameUpdateModel and passes the
// view-model + action handlers directly. The Angular bridge re-invokes this when the
// async model resolves (a fresh render into the same element updates the card).
export const renderGameUpdateNotification = (
  entry: Element,
  viewModel: GameUpdateViewModel,
  handlers: GameUpdateHandlers,
): void => {
  render(
    <NotificationLocalizationProvider>
      <GameUpdateNotification viewModel={viewModel} handlers={handlers} />
    </NotificationLocalizationProvider>,
    entry,
  );
};

export default renderGameUpdateNotification;
