import { get, post } from "@rbx/core-scripts/http";
import { EnvironmentUrls } from "@rbx/environment-urls";

export type ParentRequestResponse = {
  lockedUntil: string;
  sessionId: string;
};

export type RemoteParentRequestApi = {
  isChildSubjectToParentalControls: () => Promise<boolean>;
  getLinkedParentEmails: () => Promise<string[]>;
  sendToAllParents: (
    requestType: string,
    requestDetails?: Record<string, unknown>,
  ) => Promise<ParentRequestResponse>;
  sendToNewParent: (
    email: string,
    requestType: string,
    requestDetails: Record<string, unknown> | undefined,
    auditData: string,
  ) => Promise<ParentRequestResponse>;
};

const featureAccessUrl = `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/upsell-feature-access?featureName=IsChildSubjectToParentalControls`;
const parentEmailsUrl = `${EnvironmentUrls.userSettingsApi}/v1/account-insights/parent-emails`;
const sendToAllParentsUrl = `${EnvironmentUrls.apiGatewayUrl}/child-requests-api/v1/send-request-to-all-parents`;
const sendToNewParentUrl = `${EnvironmentUrls.apiGatewayUrl}/child-requests-api/v1/send-request-to-new-parent`;

function rememberCooldown(
  requestDetails: Record<string, unknown> | undefined,
  lockedUntil: string,
): void {
  const settingName = requestDetails == null ? undefined : Object.keys(requestDetails)[0];
  if (settingName !== undefined) {
    try {
      window.localStorage.setItem(
        `Roblox.ParentalRequest.${settingName}CooldownExpirationTime`,
        JSON.stringify(lockedUntil),
      );
    } catch {
      // Storage is only a client-side cooldown hint; the request itself already succeeded.
    }
  }
}

export const remoteParentRequestApi: RemoteParentRequestApi = {
  async isChildSubjectToParentalControls() {
    const response = await get<{ access?: string }>({
      url: featureAccessUrl,
      withCredentials: true,
      retryable: true,
    });
    return response.data.access === "Granted";
  },

  async getLinkedParentEmails() {
    const response = await get<{ parentEmails?: string[] }>({
      url: parentEmailsUrl,
      withCredentials: true,
    });
    return response.data.parentEmails ?? [];
  },

  async sendToAllParents(requestType, requestDetails) {
    const response = await post<ParentRequestResponse>(
      { url: sendToAllParentsUrl, withCredentials: true },
      { requestType, requestDetails },
    );
    rememberCooldown(requestDetails, response.data.lockedUntil);
    return response.data;
  },

  async sendToNewParent(email, requestType, requestDetails, auditData) {
    const response = await post<ParentRequestResponse>(
      {
        url: sendToNewParentUrl,
        withCredentials: true,
        headers: { "rbx-audit-data": auditData },
      },
      { email, requestType, requestDetails },
    );
    rememberCooldown(requestDetails, response.data.lockedUntil);
    return response.data;
  },
};
