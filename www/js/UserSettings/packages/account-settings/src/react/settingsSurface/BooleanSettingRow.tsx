import { useContext, useRef, type JSX } from "react";
import { useFragment, useMutation } from "react-relay";
import { useTranslation } from "react-utilities";
import { Toggle } from "@rbx/foundation-ui";
import { useSnackbar } from "@rbx/user-settings";
import { FormattedText } from "./FormattedText";
import { SettingSaveContext, type TSaveSetting } from "./SettingSaveContext";
import type { BooleanSettingRowFragment$key } from "./__generated__/BooleanSettingRowFragment.graphql";
import BooleanSettingRowFragmentNode from "./__generated__/BooleanSettingRowFragment.graphql";
import type { UpdateUserSettingMutation } from "./__generated__/UpdateUserSettingMutation.graphql";
import UpdateUserSettingMutationNode from "./__generated__/UpdateUserSettingMutation.graphql";

// From Feature.AccountSettings, which the host must load.
const notSavedKey = "MessageUnknownError";
const savedKey = "Description.SuccessDialogMessage";

/**
 * A `BooleanSetting` rendered as a labelled toggle.
 *
 * Switching it saves at once and shows the new value until the server answers. A snackbar says
 * whether the change was saved; if it wasn't, the row shows the setting's current value. A host can save
 * it another way instead by providing `SettingSaveContext`.
 *
 * A legally sensitive setting's write carries the `auditData` the row was loaded with, for the
 * surface it's shown on, so the audit log records the copy the user was shown there.
 */
export const BooleanSettingRow = ({
  setting: settingRef,
  userId,
}: {
  setting: BooleanSettingRowFragment$key;
  /** The user whose setting this is. */
  userId: string;
}): JSX.Element | null => {
  const { id, auditData, setting, enabled, on, off } = useFragment<BooleanSettingRowFragment$key>(
    BooleanSettingRowFragmentNode,
    settingRef,
  );
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const [commitUpdate, isSaving] = useMutation<UpdateUserSettingMutation>(
    UpdateUserSettingMutationNode,
  );
  const saveOverride = useContext(SettingSaveContext);
  // A ref rather than state: only the handler reads it, and it may settle after the row unmounts.
  const isOverrideSaving = useRef(false);

  const { presentation } = setting;
  if (!presentation) {
    // A setting without copy isn't rendered.
    return null;
  }

  // The option the toggle switches to.
  const target = enabled ? off : on;
  const labelId = `setting-${id}-label`;
  const descriptionId = `setting-${id}-description`;

  const saveWithOverride = (saveSetting: TSaveSetting) => {
    isOverrideSaving.current = true;
    // Called inside the executor (still synchronously) so that a save that throws before
    // returning its promise counts as a rejection and doesn't leave the row ignoring toggles.
    new Promise<void>(resolve => {
      resolve(
        saveSetting({
          id,
          name: setting.value,
          option: target.option.value,
          enabled: !enabled,
          auditData: auditData ?? null,
        }),
      );
    })
      // The host reports failures itself.
      .catch(() => undefined)
      .finally(() => {
        isOverrideSaving.current = false;
      });
  };

  const save = () => {
    // Not disabled while saving, so that the toggle keeps keyboard focus.
    if (isSaving || isOverrideSaving.current) return;
    if (saveOverride) {
      saveWithOverride(saveOverride);
      return;
    }
    const showNotSaved = () => {
      snackbarService.warning(translate(notSavedKey));
    };
    commitUpdate({
      variables: {
        userId,
        input: {
          name: setting.value,
          value: { option: target.option.value },
          ...(auditData != null && { auditData }),
        },
      },
      optimisticUpdater: store => {
        store.get(id)?.setValue(!enabled, "enabled");
      },
      updater: (store, response) => {
        // Saved, but the updated setting can't be served: keep the value the user chose rather
        // than go back to the old one.
        const result = response?.updateUserSetting;
        if (result?.__typename === "UserSettingUpdated" && result.settings[0] == null) {
          store.get(id)?.setValue(!enabled, "enabled");
        }
      },
      onCompleted: ({ updateUserSetting }) => {
        if (updateUserSetting?.__typename === "UserSettingUpdated") {
          snackbarService.success(translate(savedKey));
          return;
        }
        // Rejected, null, or a result type this client doesn't know: not saved.
        showNotSaved();
      },
      onError: showNotSaved,
    });
  };

  return (
    <div className="flex items-center justify-between gap-medium padding-y-medium">
      <div className="flex flex-col gap-xxsmall">
        <span id={labelId} className="text-body-large content-emphasis">
          {presentation.label}
        </span>
        {presentation.description && (
          <span id={descriptionId} className="text-body-small content-default">
            <FormattedText text={presentation.description} />
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-small">
        <Toggle
          aria-labelledby={labelId}
          aria-describedby={presentation.description ? descriptionId : undefined}
          isChecked={enabled}
          onCheckedChange={save}
        />
      </div>
    </div>
  );
};
