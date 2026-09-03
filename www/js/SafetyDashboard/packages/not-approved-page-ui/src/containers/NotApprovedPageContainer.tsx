import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotApprovedPageDialog from "../components/NotApprovedPageDialog";
import { NotApprovedPagePunishmentProvider } from "../context/NotApprovedPagePunishmentProvider";

const ONE_MIN_MS = 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      refetchOnMount: false,
      staleTime: ONE_MIN_MS,
    },
  },
});

interface NotApprovedPageContainerProps {
  /**
   * Optional controlled open state forwarded to {@link NotApprovedPageDialog}. When provided, the
   * host owns whether the dialog is open. When omitted, the dialog auto-opens on mount.
   */
  open?: boolean;
  /**
   * Called when the dialog requests to close while controlled (i.e. `open` is provided). Hosts
   * should update their own state to close the dialog in response.
   */
  onClose?: () => void;
}

function NotApprovedPageContainer({ open, onClose }: NotApprovedPageContainerProps): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <NotApprovedPagePunishmentProvider enableIxp>
        <NotApprovedPageDialog open={open} onClose={onClose} />
      </NotApprovedPagePunishmentProvider>
    </QueryClientProvider>
  );
}

export default NotApprovedPageContainer;
