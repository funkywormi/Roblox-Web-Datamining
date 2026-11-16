import type { JSX } from "react";
import { useFragment } from "react-relay";
import { BooleanSettingRow } from "./BooleanSettingRow";
import type {
  SettingsSurfaceRowFragment$data,
  SettingsSurfaceRowFragment$key,
} from "./__generated__/SettingsSurfaceRowFragment.graphql";
import SettingsSurfaceRowFragmentNode from "./__generated__/SettingsSurfaceRowFragment.graphql";

/**
 * Determines if a given __typename will render something
 */
export const IsTypenameRenderable = (__typename: string): boolean => {
  switch (__typename) {
    case "BooleanSetting":
      return true;
    default:
      return false;
  }
};

/**
 * Renders one setting with the component for its GraphQL type. To support another type, add an
 * inline fragment to `SettingsSurfaceRowFragment` and a case here.
 */
export const SettingsSurfaceRow = ({
  setting: settingRef,
  userId,
}: {
  setting: SettingsSurfaceRowFragment$key;
  userId: string;
}): JSX.Element | null => {
  const setting = useFragment<SettingsSurfaceRowFragment$key>(
    SettingsSurfaceRowFragmentNode,
    settingRef,
  );

  if (!IsTypenameRenderable(setting.__typename)) {
    return null;
  }

  switch (setting.__typename) {
    case "BooleanSetting":
      return <BooleanSettingRow setting={setting} userId={userId} />;
    default:
      return (
        <p>
          {setting.__typename} is considered renderable, but has no branch in SettingsSurfaceRow.
        </p>
      );
  }
};
