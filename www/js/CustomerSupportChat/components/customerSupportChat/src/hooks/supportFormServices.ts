import { UseMutationResult, UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import * as Sentry from "@sentry/react";

import debounce from "lodash/debounce";
import { SupportMetaData } from "../core/types/serviceMetadataResponse";
import { GenericResponse, SupportContextKey, SupportedReceivedValues } from "../core/types/common";
import { CreateSupportTicketRequestModel } from "../core/types/supportTicket";
import { normalizeUsername } from "../core/helpers/supportFormHelpers";
import { UserSettingsLegacy, UserSettingsV1 } from "../core/types/userSettings";
import { SupportContext } from "../providers/SupportContextProvider";
import fetchMetadata from "./fetchMetadata";
import fetchUserSettingsLegacy from "./fetchUserSettingsLegacy";
import fetchUserSettingsV1 from "./fetchUserSettingsV1";
import sendSupportForm from "./sendSupportForm";
import lookupUsername from "./lookupUsername";
/**
 * Fetches metadata necessary for the support form, including dropdown options and various account settings.
 */
export const useFetchMetadata = (): UseQueryResult<SupportMetaData, Error> =>
  useQuery([SupportContextKey.Metadata], fetchMetadata);

/**
 * Fetches legacy user settings from the server via relative /my/settings/json route.
 */
export const useFetchUserSettingsLegacy = (): UseQueryResult<UserSettingsLegacy, Error> =>
  useQuery([SupportContextKey.UserSettingsLegacy], fetchUserSettingsLegacy);

/**
 * Fetches v1 user settings from the server via apis.roblox.com/user-settings-api/v1/user-settings
 */
export const useFetchUserSettingsV1 = (): UseQueryResult<UserSettingsV1, Error> =>
  useQuery([SupportContextKey.UserSettingsV1], fetchUserSettingsV1);

type UseValidateUsernameResult = UseMutationResult<boolean, unknown, string | undefined> & {
  validateUsername: (username?: string) => void;
  isUsernameValid: boolean | undefined;
};

/**
 * Provides a custom hook/wrapper providing closure/loading state to validate a username manually, including states for loading and validation result.
 * We introduce this wrapper so we only fetch validation when needed (e.g. only on username input blur instead of each username change) instead of useQuery directly.
 */
export const useValidateUsername = (): UseValidateUsernameResult => {
  // Validates the username via `${EnvironmentUrls.authApi}/v2/usernames`; useCallback to maintain func ref and queryClient wrapper to avoid unnecessary fetches on each input change.
  // https://auth.sitetest3.robloxlabs.com/v2/usernames/validate?username=chatEligibleRabi223&context=2&birthday=Thu+Jun+21+2018

  const request = useMutation({
    mutationFn: async (username?: string) => {
      if (!username) return false;
      let isValidUsername = false;

      try {
        const data = await lookupUsername(username);
        const normalizedUsername = normalizeUsername(username);
        isValidUsername = Boolean(
          data?.usernames?.some(
            (inboundUsername: string) => normalizeUsername(inboundUsername) === normalizedUsername,
          ),
        );
      } catch (error) {
        isValidUsername = false;
      }
      return isValidUsername;
    },
  });

  const debouncedValidateUsername = useMemo(
    () =>
      debounce((username?: string) => {
        request.mutate(username);
      }, 400),
    // eslint needs to be updated, this is a valid dependency
    // TODO: fix me
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [request.mutate],
  );

  return {
    ...request,
    validateUsername: debouncedValidateUsername,
    isUsernameValid: request.data,
  };
};

type UseSubmitSupportFormResult = UseMutationResult<
  GenericResponse,
  Error,
  { url: string; formData: CreateSupportTicketRequestModel }
> & {
  submitSupportForm: (
    params: { url: string; formData: CreateSupportTicketRequestModel },
    options?: { onSuccess?: () => void },
  ) => Promise<GenericResponse>;
};

/**
 * Provides a custom hook/wrapper to submit support form data manually, allowing for more controlled invocation, e.g., when a form is submitted.
 */
export const useSubmitSupportForm = (): UseSubmitSupportFormResult => {
  const { updateSupportInquiryContext } = useContext(SupportContext);

  const result = useMutation<
    GenericResponse,
    Error,
    { url: string; formData: CreateSupportTicketRequestModel }
  >(async ({ url, formData }) => {
    const rData = await sendSupportForm(url, formData);

    Sentry.captureMessage("Support Form Submission Response Received", {
      level: "info",
      tags: {
        component: "SupportForm",
        success: rData?.success?.toString() ?? "false",
        support_received: rData?.supportedReceived?.toString() ?? "",
        conversation_id: rData?.conversationId ?? "",
        message: rData?.message ?? "",
      },
    });

    // C3 Chat
    if (rData?.supportedReceived === SupportedReceivedValues.C3Chat && rData?.chatMetadata) {
      updateSupportInquiryContext({
        [SupportContextKey.C3ChatConfig]: rData.chatMetadata,
      });
    }
    // Sierra Chat
    if (rData?.supportedReceived === SupportedReceivedValues.SierraChat && rData?.conversationId) {
      updateSupportInquiryContext({
        [SupportContextKey.ConversationId]: rData.conversationId,
        ...(rData.userTouRegion && { [SupportContextKey.UserTouRegion]: rData.userTouRegion }),
        ...(rData.topicClassification && {
          [SupportContextKey.TopicClassification]: rData.topicClassification,
        }),
      });
    }
    return rData;
  });
  return {
    ...result,
    submitSupportForm: result.mutateAsync,
  };
};
