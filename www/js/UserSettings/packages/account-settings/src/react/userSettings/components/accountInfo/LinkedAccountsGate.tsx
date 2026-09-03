import React, { useCallback, useState } from "react";
import {
  InfiniteData,
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AccountIntegrityChallengeService } from "Roblox";
import { useTranslation } from "@rbx/core-scripts/react";
import { Button, FeedbackBanner } from "@rbx/foundation-ui";
import {
  getLinkedAccounts,
  getLinkedAccountsQueryKey,
  LinkedAccountsDashboard,
  LinkedAccountsDirection,
} from "@rbx/account-security/linkedAccounts";
import type { GetLinkedAccountsResponse } from "@rbx/account-security/linkedAccounts";
import SettingsSection from "../../../common/components/SettingsSection";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";

const PAGE_SIZE = 10;
const LINKED_ACCOUNTS_SECTION_ID = "rbx-linked-accounts-section";

const LinkedAccountsGateContent = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const queryClient = useQueryClient();

  const {
    mutate: verifyLinkedAccounts,
    error,
    isError,
    isPending: isVerifying,
    isSuccess: isUnlocked,
  } = useMutation({
    mutationFn: async () => {
      const result = await getLinkedAccounts({
        direction: LinkedAccountsDirection.Incoming,
        pageSize: PAGE_SIZE,
        pageToken: "",
      });

      if (result.isError) {
        throw result.errorRaw;
      }

      return result.value;
    },
    retry: false,
    onSuccess: response => {
      // The verified response also acts as the first page for the dashboard.
      queryClient.setQueryData<InfiniteData<GetLinkedAccountsResponse>>(
        getLinkedAccountsQueryKey(LinkedAccountsDirection.Incoming),
        {
          pages: [response],
          pageParams: [""],
        },
      );
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Generic } = AccountIntegrityChallengeService;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const accessError = isError && !Generic.ChallengeError.matchAbandoned(error);

  const handleVerify = useCallback(() => {
    verifyLinkedAccounts();
  }, [verifyLinkedAccounts]);

  // Only display the dashboard if GCS verifies reauth.
  // Access error is shown inside the component's box.
  return (
    <SettingsSection
      id={LINKED_ACCOUNTS_SECTION_ID}
      title={translate(accountInfoTranslationConstants.linkedAccounts.heading)}
    >
      <div className="flex flex-col gap-xxlarge">
        {!isUnlocked ? (
          <div
            className="flex flex-col gap-medium padding-large radius-medium bg-surface-100"
            data-testid="linked-accounts-gate"
          >
            <div className="flex flex-col items-stretch gap-large medium:flex-row medium:items-center">
              <div className="flex flex-col gap-xxsmall min-width-0 grow-1 max-width-[50ch]">
                <h3 className="text-title-large margin-none">
                  {translate(accountInfoTranslationConstants.linkedAccounts.verification.heading)}
                </h3>
                <span className="text-body-medium">
                  {translate(
                    accountInfoTranslationConstants.linkedAccounts.verification.description,
                  )}
                </span>
              </div>
              <Button
                variant="Emphasis"
                size="Medium"
                onClick={handleVerify}
                isDisabled={isVerifying}
                className="shrink-0 medium:margin-left-auto"
                data-testid="linked-accounts-gate-verify"
              >
                {translate(accountInfoTranslationConstants.linkedAccounts.verification.action)}
              </Button>
            </div>

            {accessError && (
              <FeedbackBanner
                className="margin-none"
                variant="Emphasis"
                severity="Warning"
                layout="Stacked"
                title={translate(accountInfoTranslationConstants.linkedAccounts.error)}
              />
            )}
          </div>
        ) : (
          <LinkedAccountsDashboard />
        )}
      </div>
    </SettingsSection>
  );
};

export const LinkedAccountsGate = (): React.JSX.Element => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <LinkedAccountsGateContent />
    </QueryClientProvider>
  );
};

export default LinkedAccountsGate;
