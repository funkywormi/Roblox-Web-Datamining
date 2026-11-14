import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@rbx/core-scripts/react";
import { NotificationStreamShell } from "./NotificationStreamShell";
import { NotificationLocalizationProvider } from "../sendrNotificationStream/context/NotificationLocalizationProvider";

// core-ui's Popover renders through unstable_renderSubtreeIntoContainer, which drops the host's QueryClientProvider.
export const DotnetNotificationStreamShell = () => (
  <QueryClientProvider client={queryClient}>
    <NotificationLocalizationProvider>
      <NotificationStreamShell />
    </NotificationLocalizationProvider>
  </QueryClientProvider>
);

export default DotnetNotificationStreamShell;
