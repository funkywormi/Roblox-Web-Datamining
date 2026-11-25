import { createContext } from "react";

/** One toggle of a `BooleanSettingRow`, as handed to a host's `TSaveSetting`. */
export type TSaveSettingRequest = {
  /** The Relay record id of the row's setting, for updating it in the store. */
  id: string;
  /** The setting's name on the surface (`setting.value`). */
  name: string;
  /** The option the toggle switches to (`option.value`). */
  option: string;
  /** Whether the toggle is on after the switch. */
  enabled: boolean;
  /**
   * The setting's `auditData` on the row's surface, to send with the write so its audit log records
   * the copy the user was shown. Null when the setting isn't legally sensitive, or its copy is
   * missing.
   */
  auditData: string | null;
};

/**
 * Saves one toggle in place of the default `updateUserSetting` mutation. The host owns the whole
 * save: showing the new value, reporting success or failure, and refreshing the surface. The row
 * only waits for the promise to settle before accepting another toggle, and ignores a rejection.
 */
export type TSaveSetting = (request: TSaveSettingRequest) => Promise<void>;

/**
 * Lets a host replace how `BooleanSettingRow`s save, e.g. a parent saving a child's setting
 * through parental controls. With no provider (null), rows save with `updateUserSetting`.
 */
export const SettingSaveContext = createContext<TSaveSetting | null>(null);
