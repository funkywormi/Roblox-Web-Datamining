import { useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import { get, post } from "@rbx/core-scripts/http";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import environmentUrls from "@rbx/environment-urls";
import {
  NotApprovedUIProvider,
  NotApprovedPageContainer,
  translationConfig,
} from "@rbx/not-approved-page-ui";
import type { NotApprovedUIConfig } from "@rbx/not-approved-page-ui";
import { HOME_URL, LOGOUT_URL } from "../../shared/url";
import { getDetailPath } from "../../shared/utils/navigation";

interface AccountRestrictionDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Multi-step flow for account restrictions, rendered with `NotApprovedPageContainer` from
 * `@rbx/not-approved-page-ui`. The dialog displays information about the user's current
 * account-level restriction (e.g. temporary suspensions, permanent bans, etc.).
 */
const AccountRestrictionDialogContent = ({ open, onClose }: AccountRestrictionDialogProps) => {
  const { translate } = useTranslation();
  const history = useHistory();

  const onAppealsRedirect = useCallback(
    (violationUid?: string) => {
      onClose();
      history.push(violationUid ? getDetailPath(violationUid) : "/violations");
    },
    [history, onClose],
  );

  const config = useMemo<NotApprovedUIConfig>(
    () => ({
      translate,
      httpGet: async <T,>(url: string): Promise<T> => {
        const response = await get<T>({ url, withCredentials: true });
        return response.data;
      },
      httpPost: async <T,>(url: string, body?: object): Promise<T> => {
        const response = await post<T>({ url, withCredentials: true }, body);
        return response.data;
      },
      userModerationApiUrl: environmentUrls.userModerationApi,
      apiGatewayUrl: environmentUrls.apiGatewayUrl,
      websiteUrl: environmentUrls.websiteUrl,
      onLogout: async () => {
        await post({ url: LOGOUT_URL, withCredentials: true });
        window.location.href = HOME_URL;
      },
      onAccountReactivated: () => {
        window.location.href = HOME_URL;
      },
      sendAnalyticsEvent: event => {
        sendEventWithTarget(event.eventName, event.context, event.properties, targetTypes.WWW);
      },
      platform: "WebApp",
      readOnly: true,
      onAppealsRedirect,
    }),
    [translate, onAppealsRedirect],
  );

  return (
    <NotApprovedUIProvider config={config}>
      <NotApprovedPageContainer open={open} onClose={onClose} />
    </NotApprovedUIProvider>
  );
};

const AccountRestrictionDialog = ({ open, onClose }: AccountRestrictionDialogProps) => {
  return (
    <TranslationProvider config={translationConfig}>
      <AccountRestrictionDialogContent open={open} onClose={onClose} />
    </TranslationProvider>
  );
};

export default AccountRestrictionDialog;
