import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import { Cookies } from "@rbx/core-scripts/legacy/Roblox";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import {
  inactivityTimeoutSeconds,
  darkModeColors,
  lightModeColors,
} from "../core/constants/sierra";
import { isProd } from "../core/helpers/supportEnvironment";
import { getCatFromId, getSubCatNameFromId } from "../core/helpers/supportFormHelpers";
import { SierraConfig } from "../core/types/sierra";
import { SupportContext } from "../providers/SupportContextProvider";
import useGetSierraChatConfigPayload from "./useGetSierraChatConfigPayload";
import { Theme } from "../core/types/userSettings";

export interface UseSierraSDKResult {
  isSDKLoaded: boolean;
  setIsSDKLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  isSierraChatLoading: boolean;
  isLoading: boolean;
  hasSDKLoadError: boolean;
}

// Custom hook to manage Sierra SDK state
export const useSierra = (guardianApprovalId: string): UseSierraSDKResult => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isSDKRendered, setIsSDKRendered] = useState(false);
  const [hasSDKLoadError, setHasSDKLoadError] = useState(false);
  const [isSierraChatLoading, setIsSierraChatLoading] = useState(true);
  const isInitialized = useRef(false);
  const {
    submittedSupportFormData,
    metadata,
    userSettingsV1,
    conversationId,
    userTouRegion,
    topicClassification,
  } = useContext(SupportContext);
  const {
    data: chatConfigData,
    isSuccess: isChatConfigSuccess,
    isError: isChatConfigError,
    isLoading: isChatConfigLoading,
  } = useGetSierraChatConfigPayload(guardianApprovalId);
  // Handle Support Form + u13 topic/subtopic normalization
  const [sierraMainCategory, sierraSubCategory] = useMemo(() => {
    let defaultCategory = guardianApprovalId
      ? (chatConfigData?.topic ?? "")
      : (submittedSupportFormData?.helpCategoryType ?? "");

    let defaultSubCategory = guardianApprovalId
      ? (chatConfigData?.subtopic ?? "")
      : (submittedSupportFormData?.helpSubCategoryType ?? "");

    if (!guardianApprovalId) {
      return [defaultCategory, defaultSubCategory];
    }

    const categoryFromId = getCatFromId(metadata, defaultCategory);
    const subCategoryFromId = getSubCatNameFromId(defaultSubCategory, categoryFromId);
    if (categoryFromId && subCategoryFromId) {
      [defaultCategory, defaultSubCategory] = [
        categoryFromId.mainCategory.name,
        subCategoryFromId.name,
      ];
    }

    return [defaultCategory, defaultSubCategory];
  }, [
    chatConfigData?.topic,
    chatConfigData?.subtopic,
    submittedSupportFormData?.helpSubCategoryType,
    submittedSupportFormData?.helpCategoryType,
    guardianApprovalId,
    metadata,
  ]);

  // Form Sierra widget config
  // https://docs.google.com/document/d/1zcanbr7OnuX8jTMo3JZA8Ok_gt4vSXnlo5fs_PeFnhA/edit#heading=h.2wbu20k5us1t
  const normalizedSierraVars: Record<string, string> = useMemo(() => {
    const username = guardianApprovalId
      ? chatConfigData?.username
      : submittedSupportFormData?.username;
    const email = guardianApprovalId ? chatConfigData?.email : submittedSupportFormData?.email;
    const device = guardianApprovalId
      ? chatConfigData?.deviceType
      : submittedSupportFormData?.deviceType;
    const firstName = guardianApprovalId ? "Guest" : submittedSupportFormData?.firstName;

    return {
      CATEGORY: sierraMainCategory,
      SUBCATEGORY: sierraSubCategory,
      USERNAME: username || "",
      FIRST_NAME: firstName || "",
      CONTACT_EMAIL: email || "",
      DEVICE: device || "",
      ENVIRONMENT: isProd ? "production" : "staging",
      BTID: Cookies?.getBrowserTrackerId() || "",
      BYPASS_USER_SESSION_CHECK: isProd ? "False" : "True",
      UNDER_THIRTEEN_PARENT: guardianApprovalId ? "True" : "False",
      ...(chatConfigData?.ticketId && { TICKET_ID: chatConfigData?.ticketId }),
      ROBLOX_CONVERSATION_ID: conversationId || "",
      USER_TOU_REGION: userTouRegion || "",
      TOPIC_CLASSIFICATION: topicClassification || "",
    };
  }, [
    guardianApprovalId,
    chatConfigData?.username,
    chatConfigData?.email,
    chatConfigData?.deviceType,
    chatConfigData?.ticketId,
    submittedSupportFormData?.username,
    submittedSupportFormData?.email,
    submittedSupportFormData?.deviceType,
    submittedSupportFormData?.firstName,
    sierraMainCategory,
    sierraSubCategory,
    conversationId,
    userTouRegion,
    topicClassification,
  ]);

  // Dark mode theme comes from v1 user settings (apis.roblox.com/user-settings-api/v1/user-settings)
  const isDarkMode = useMemo(
    () => userSettingsV1?.themeType === Theme.Dark,
    [userSettingsV1?.themeType],
  );

  // We want to localize the greeting message based on the user's region by specifying the brand name in the greeting message
  function getGreeting(region: string): string {
    return `Hi there, I'm the ${region === "vietnam" ? "Roblox VN" : "Roblox"} AI Support Assistant. I can answer questions about ${region === "vietnam" ? "Roblox VN" : "Roblox"}, and help you with your account. How can I help you today?`;
  }

  // Normalized Sierra config (after widget init/load) to embed chat with current user/ticket data
  const getSierraConfig = useCallback((): SierraConfig => {
    const sierraConfig: SierraConfig = {
      inactivityTimeoutSeconds,
      allowInternalFeedback: !isProd,
      persistence: "tab",
      preload: "timeout",
      variables: normalizedSierraVars,
      initialUserMessage: guardianApprovalId ? "" : (submittedSupportFormData?.message ?? ""),
      customHideTitleBar: true,
      colors: isDarkMode ? darkModeColors : lightModeColors,
      customStyle: {
        borderColor: "transparent",
      },
      display: "custom",
      customContainer: document.getElementById("chatWrapper")!,
      showUserSurveyOnConversationEnd: true,
      onLoad: () => {
        setIsSierraChatLoading(false);
      },
      customGreeting: getGreeting(userTouRegion ?? "global"),
    };
    return sierraConfig;
  }, [
    normalizedSierraVars,
    guardianApprovalId,
    submittedSupportFormData?.message,
    isDarkMode,
    userTouRegion,
  ]);

  const openSierraChatWidget = useCallback(() => {
    try {
      const refreshedSierraConfig = getSierraConfig();
      window.sierraConfig = refreshedSierraConfig;
      window.sierra?.init(refreshedSierraConfig);
      window.sierra?.openChatModal();

      Sentry.captureMessage("Support Chatbot Sierra Widget Opened", {
        level: "info",
        tags: {
          component: "SupportForm",
          isU13Flow: guardianApprovalId ? "true" : "false",
          guardianApprovalId,
          conversation_id: conversationId,
          support_username: normalizedSierraVars.USERNAME,
          support_help_category: sierraSubCategory,
          support_help_subcategory: sierraSubCategory,
          is_user_authenticated: authenticatedUser.isAuthenticated.toString(),
        },
      });
    } catch (e) {
      const sierraErrorMessage = e instanceof Error ? e.message : String(e);

      Sentry.captureMessage(`Support Chatbot Sierra Error: ${sierraErrorMessage}`, {
        level: "error",
        tags: {
          component: "SupportForm",
          isU13Flow: guardianApprovalId ? "true" : "false",
          guardianApprovalId,
          conversation_id: conversationId,
          support_username: normalizedSierraVars.USERNAME,
          support_help_category: sierraSubCategory,
          support_help_subcategory: sierraSubCategory,
          is_user_authenticated: authenticatedUser.isAuthenticated.toString(),
        },
      });

      setHasSDKLoadError(true);

      if (!isProd) console.error(e);
    }
  }, [
    conversationId,
    getSierraConfig,
    guardianApprovalId,
    normalizedSierraVars.USERNAME,
    sierraSubCategory,
  ]);

  useEffect(() => {
    if (isSDKRendered || isInitialized.current) return;

    if (isSDKLoaded && !guardianApprovalId) {
      openSierraChatWidget();
      isInitialized.current = true;
      return;
    }

    const isU13ChatbotReadyToInit =
      isSDKLoaded && isChatConfigSuccess && normalizedSierraVars.CONTACT_EMAIL;

    if (isU13ChatbotReadyToInit) {
      openSierraChatWidget();
      setIsSDKRendered(true);
      isInitialized.current = true;
      return;
    }

    const isConfigOrSDKErroring =
      (isSDKLoaded && !normalizedSierraVars.CONTACT_EMAIL && !isChatConfigLoading) ||
      isChatConfigError;
    if (isConfigOrSDKErroring) setHasSDKLoadError(true);
  }, [
    isSDKLoaded,
    isChatConfigSuccess,
    isChatConfigError,
    getSierraConfig,
    guardianApprovalId,
    normalizedSierraVars,
    openSierraChatWidget,
    isSDKRendered,
    isChatConfigLoading,
  ]);

  const isLoading = useMemo(() => {
    // Sierra does not trigger their onLoad func until a visibility change is dispatched becuase they typically build with modal widgets not embeds
    window.dispatchEvent(new Event("visibilitychange"));
    return isChatConfigLoading || !isSDKLoaded || isSierraChatLoading;
  }, [isChatConfigLoading, isSDKLoaded, isSierraChatLoading]);
  return {
    isSDKLoaded,
    setIsSDKLoaded,
    isSierraChatLoading,
    isLoading,
    hasSDKLoadError,
  };
};
