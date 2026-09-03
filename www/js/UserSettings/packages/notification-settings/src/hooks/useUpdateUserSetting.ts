import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { useSnackbar, type TOptionValue } from "@rbx/user-settings";
import { updateUserSetting } from "../services/userSettingsService";
import translationConstants from "../constants/translationConstants";

type UseUpdateUserSettingOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};

type UseUpdateUserSettingReturn = {
  updateSetting: (params: {
    settingKey: string;
    value: TOptionValue;
    auditHeader?: string;
  }) => void;
  isPending: boolean;
};

/**
 * Hook for updating user settings with loading state and feedback.
 * Provides isPending to prevent race conditions from rapid toggles.
 */
export function useUpdateUserSetting(
  options?: UseUpdateUserSettingOptions,
): UseUpdateUserSettingReturn {
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  const mutation = useMutation({
    mutationFn: ({
      settingKey,
      value,
      auditHeader,
    }: {
      settingKey: string;
      value: TOptionValue;
      auditHeader?: string;
    }) => updateUserSetting(settingKey, value, { auditHeader }),
    onSuccess: () => {
      snackbarService.success(translate(translationConstants.savedSuccessfully));
      options?.onSuccess?.();
    },
    onError: () => {
      snackbarService.warning(translate(translationConstants.unknownError));
      options?.onError?.();
    },
  });

  return {
    updateSetting: mutation.mutate,
    isPending: mutation.isPending,
  };
}
