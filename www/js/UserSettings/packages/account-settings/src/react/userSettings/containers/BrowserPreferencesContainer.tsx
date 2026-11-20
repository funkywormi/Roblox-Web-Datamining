import { useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { getTheme as getThemeGlobal } from "@rbx/core-scripts/theme";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import AppThemeSetting from "../components/browserPreferences/AppThemeSetting";
import ColorModeSetting from "../components/browserPreferences/ColorMode";
import { themes, themesByKey } from "../constants/appThemes";

export default function BrowserPreferencesContainer() {
  const { translate } = useTranslation();
  const [theme, setTheme] = useState(themesByKey.get(getThemeGlobal()) ?? null);
  return (
    <section className="settings-container-v2 flex flex-col gap-xlarge padding-bottom-large">
      <div className="settings-v2-header">
        <h2 className="text-heading-medium content-emphasis margin-none">
          {translate(navigationTranslationConstants.browserPreferencesHeading)}
        </h2>
      </div>
      <ColorModeSetting disabled={theme?.key === "halloween-2026"} />
      <AppThemeSetting
        theme={theme}
        setTheme={setTheme}
        themes={themes}
        themesByKey={themesByKey}
      />
    </section>
  );
}
