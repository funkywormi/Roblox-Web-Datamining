import type { JSX } from "react";
import { useFragment } from "react-relay";
import { FormattedText } from "./FormattedText";
import { SettingsSurfaceRow, IsTypenameRenderable } from "./SettingsSurfaceRow";
import type { SettingsSurfaceFragment$key } from "./__generated__/SettingsSurfaceFragment.graphql";
import SettingsSurfaceFragmentNode from "./__generated__/SettingsSurfaceFragment.graphql";

/**
 * Renders a settings surface: its title and intro, then each setting in server order. Renders
 * nothing when the surface has no settings.
 */
export const SettingsSurface = ({
  surface: surfaceRef,
  userId,
  hideTitle = false,
}: {
  surface: SettingsSurfaceFragment$key;
  /** The user the surface was queried for. */
  userId: string;
  /** Leave out the surface's heading when the host already shows one. The intro still renders. */
  hideTitle?: boolean;
}): JSX.Element | null => {
  const { header, settings } = useFragment<SettingsSurfaceFragment$key>(
    SettingsSurfaceFragmentNode,
    surfaceRef,
  );
  // A null item is a setting the server couldn't serve; skip it rather than lose the surface.
  const servedSettings = settings.filter(setting => setting != null);
  if (servedSettings.length === 0) {
    return null;
  }

  const { presentation } = header;
  const settingsToRender = servedSettings
    .filter(setting => IsTypenameRenderable(setting.__typename))
    .map(setting => <SettingsSurfaceRow key={setting.id} setting={setting} userId={userId} />);

  return (
    <section className="flex flex-col gap-medium">
      {presentation && (
        <div className="flex flex-col gap-xsmall">
          {!hideTitle && (
            <h2 className="text-heading-small content-emphasis">{presentation.label}</h2>
          )}
          {presentation.description && (
            <p className="text-body-medium content-default">
              <FormattedText text={presentation.description} />
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col">
        {settingsToRender.length > 0 ? settingsToRender : <p>No settings to render.</p>}
      </div>
    </section>
  );
};
