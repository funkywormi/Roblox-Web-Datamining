import { useTranslation } from "@rbx/core-scripts/react";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import AppThemeSetting from "../components/browserPreferences/AppThemeSetting";
import ColorModeSetting from "../components/browserPreferences/ColorMode";

export default function BrowserPreferencesContainer() {
  const { translate } = useTranslation();
  return (
    <section className="settings-container-v2 flex flex-col gap-xlarge padding-bottom-large">
      <div className="settings-v2-header">
        <h2 className="text-heading-medium content-emphasis margin-none">
          {translate(navigationTranslationConstants.browserPreferencesHeading)}
        </h2>
      </div>
      <ColorModeSetting />
      <AppThemeSetting />
    </section>
  );
}
