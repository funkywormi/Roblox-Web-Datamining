import { useCallback, useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { ProfileType } from "@rbx/profile-platform";
import analyticsService from "../analytics/analyticsService";
import { refreshProfileWithRetry } from "../utils/profileUtils";

type UseEditAliasDialogOptions = {
  profileId?: string;
  profileType: ProfileType;
  primaryName: string;
  refreshProfilePlatform: () => Promise<void>;
  translate: (key: string, params?: Record<string, string | number>) => string;
  systemFeedbackService: {
    warning: (message?: string) => void;
    success: (message?: string) => void;
  };
};

type SaveAliasVariables = {
  trimmedAlias: string;
  profileId: string;
};

const MAX_CHARACTERS_FOR_ALIAS = 20;

const useEditAliasDialog = ({
  profileId,
  profileType,
  primaryName,
  refreshProfilePlatform,
  translate,
  systemFeedbackService,
}: UseEditAliasDialogOptions) => {
  const [isEditAliasDialogOpen, setIsEditAliasDialogOpen] = useState(false);
  const [aliasValue, setAliasValue] = useState("");
  const [textCount, setTextCount] = useState(0);
  const [hasErrored, setHasErrored] = useState(false);

  // Unicode character counting function (matches old implementation)
  const unicodeLength = useCallback((str: string) => Array.from(str).length, []);

  const saveAliasMutation = useMutation({
    mutationFn: ({ trimmedAlias, profileId: pid }: SaveAliasVariables) =>
      http.post<{ status: string }>(
        {
          url: `${environmentUrls.contactsApi}/v1/user/tag`,
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
        {
          targetUserId: parseInt(pid, 10),
          userTag: trimmedAlias,
        },
      ),
    onSuccess: (response, { trimmedAlias, profileId: pid }) => {
      if (response.data.status === "Success") {
        analyticsService.fireAnalyticsEvent(profileType, "buttonClick", {
          btn: "saveAlias",
          alias: trimmedAlias,
          playerId: pid,
        });

        setIsEditAliasDialogOpen(false);
        setAliasValue("");
        setTextCount(0);
        systemFeedbackService.success(translate("Description.SuccessDialogMessage"));
        refreshProfileWithRetry(refreshProfilePlatform, trimmedAlias || primaryName, 3000).catch(
          () => undefined,
        );
      } else {
        analyticsService.fireAnalyticsEvent(profileType, "customNameInvalidInput", {
          alias: trimmedAlias,
          playerId: pid,
        });
        setHasErrored(true);
      }
    },
    onError: (error: unknown, { trimmedAlias, profileId: pid }) => {
      console.error(
        "Failed to save alias:",
        error instanceof Error ? error.message : String(error),
      );
      analyticsService.fireAnalyticsEvent(profileType, "customNameInvalidInput", {
        alias: trimmedAlias,
        playerId: pid,
      });
      setHasErrored(true);
    },
  });

  const handleEditAlias = useCallback(() => {
    const currentAlias = "";
    setAliasValue(currentAlias);
    setTextCount(unicodeLength(currentAlias));
    setHasErrored(false);
    setIsEditAliasDialogOpen(true);

    // EventStream: modalOpen - customizeName
    analyticsService.fireAnalyticsEvent(profileType, "modalOpen", {
      origin: "userProfile",
      playerId: profileId ?? "",
    });
  }, [unicodeLength, profileType, profileId]);

  const handleSaveAlias = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }

    const trimmedAlias = aliasValue.trim();
    const aliasLength = unicodeLength(trimmedAlias);

    if (aliasLength > MAX_CHARACTERS_FOR_ALIAS) {
      setHasErrored(true);
      return;
    }

    setHasErrored(false);
    saveAliasMutation.mutate({ trimmedAlias, profileId });
  }, [profileId, systemFeedbackService, translate, aliasValue, unicodeLength, saveAliasMutation]);

  const handleCloseDialog = useCallback(() => {
    // EventStream: buttonClick - closeCustomName
    analyticsService.fireAnalyticsEvent(profileType, "buttonClick", {
      btn: "closeCustomName",
      playerId: profileId ?? "",
    });

    setIsEditAliasDialogOpen(false);
    setAliasValue("");
    setTextCount(0);
    setHasErrored(false);
  }, [profileType, profileId]);

  const handleAliasInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      let unicodeLen = unicodeLength(newValue);

      if (unicodeLen > MAX_CHARACTERS_FOR_ALIAS) {
        if (textCount === MAX_CHARACTERS_FOR_ALIAS) {
          return;
        }
        newValue = Array.from(newValue).slice(0, MAX_CHARACTERS_FOR_ALIAS).join("");
        unicodeLen = MAX_CHARACTERS_FOR_ALIAS;
      }

      setAliasValue(newValue);
      setTextCount(unicodeLen);
      setHasErrored(false);

      // EventStream: customNameMaxLimit
      if (unicodeLen === MAX_CHARACTERS_FOR_ALIAS) {
        analyticsService.fireAnalyticsEvent(profileType, "customNameMaxLimit", {
          alias: newValue,
          playerId: profileId ?? "",
        });
      }

      // EventStream: customNameClearedInput
      if (unicodeLen === 0) {
        analyticsService.fireAnalyticsEvent(profileType, "customNameClearedInput", {
          playerId: profileId ?? "",
        });
      }
    },
    [unicodeLength, textCount, profileType, profileId],
  );

  return {
    aliasValue,
    handleAliasInputChange,
    handleCloseDialog,
    handleEditAlias,
    handleSaveAlias,
    hasErrored,
    isEditAliasDialogOpen,
    isSaving: saveAliasMutation.isPending,
    maxCharacters: MAX_CHARACTERS_FOR_ALIAS,
    textCount,
  };
};

export default useEditAliasDialog;
