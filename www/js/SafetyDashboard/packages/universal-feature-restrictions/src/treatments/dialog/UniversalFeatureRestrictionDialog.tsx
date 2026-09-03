import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dialog, DialogContent, Snackbar } from "@rbx/foundation-ui";
import { RestrictionScopeProvider } from "../../contexts/RestrictionScopeContext";
import { UniversalFeatureRestrictionsConfigProvider } from "../../contexts/UniversalFeatureRestrictionsConfigContext";
import type { UniversalFeatureRestrictionsSurfaceProps } from "../../contexts/UniversalFeatureRestrictionsContext";
import type { UniversalFeatureRestrictionsConfig } from "../../types/hostConfig";
import DialogContentView from "./DialogContentView";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        refetchOnMount: false,
        staleTime: 60 * 1000,
      },
    },
  });

export interface UniversalFeatureRestrictionDialogProps
  extends UniversalFeatureRestrictionsSurfaceProps {
  config: UniversalFeatureRestrictionsConfig;
}

/**
 * Self-contained Universal Feature Restriction dialog with an isolated query cache and all package
 * providers. Hosts render this from their static or deferred surface adapter.
 */
const UniversalFeatureRestrictionDialog = ({
  config,
  request,
  open,
  onDismiss,
}: UniversalFeatureRestrictionDialogProps) => {
  const [queryClient] = useState(createQueryClient);
  const [isAppealFeedbackVisible, setIsAppealFeedbackVisible] = useState(false);

  const { abuseVector, overrides, onAppeal } = request;
  const readOnly = overrides?.readOnly;

  return (
    <QueryClientProvider client={queryClient}>
      <UniversalFeatureRestrictionsConfigProvider config={config}>
        <RestrictionScopeProvider abuseVector={abuseVector} readOnly={readOnly}>
          <Dialog
            open={open}
            isModal
            size="Medium"
            hasCloseAffordance={false}
            onOpenChange={
              readOnly
                ? nextOpen => {
                    if (!nextOpen) onDismiss();
                  }
                : undefined
            }
          >
            <DialogContent
              className="width-full"
              onOpenAutoFocus={event => {
                event.preventDefault();
              }}
            >
              <DialogContentView
                onDismiss={onDismiss}
                overrides={overrides}
                onAppeal={onAppeal}
                showAppealSnackbar={() => {
                  setIsAppealFeedbackVisible(true);
                }}
                translationsReady={config.translationsReady ?? true}
              />
            </DialogContent>
          </Dialog>

          {isAppealFeedbackVisible && (
            <Snackbar
              title={config.translate("Description.FeedbackHelps")}
              icon="icon-filled-check"
              onClose={() => {
                setIsAppealFeedbackVisible(false);
              }}
              closeIconAriaLabel={config.translate("Action.Close")}
              shouldAutoDismiss
            />
          )}
        </RestrictionScopeProvider>
      </UniversalFeatureRestrictionsConfigProvider>
    </QueryClientProvider>
  );
};

export default UniversalFeatureRestrictionDialog;
