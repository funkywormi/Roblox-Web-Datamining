import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { type Mode, getMode, setMode } from "@rbx/core-scripts/color-mode";
import { Dropdown, Menu, MenuSection, MenuItem } from "@rbx/foundation-ui";
import { modeTranslations } from "../constants/theme";
import SettingsSection from "../../common/components/SettingsSection";
import accountInfoTranslationConstants from "../constants/contentConstants/accountInfoTranslationConstants";
import navigationTranslationConstants from "../constants/contentConstants/navigationTranslationConstants";
import AppThemeSetting from "../components/browserPreferences/AppThemeSetting";

const themeModeHeadingId = "app-theme-mode-heading";

const isMode = (value: string): value is Mode => value in modeTranslations;

export const BrowserPreferencesContainer = () => {
  const [theme, setTheme] = useState(getMode());
  const { translate } = useTranslation();
  const options = useMemo(
    () => (
      <MenuSection>
        {Object.entries(modeTranslations).map(([value, translationKey]) => (
          <MenuItem key={value} title={translate(translationKey)} value={value} />
        ))}
      </MenuSection>
    ),
    [translate],
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getMode());
    });
    observer.observe(document.body, { attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="settings-container-v2">
      <div className="settings-v2-header" id="rbx-browser-preferences-settings-header">
        <h2>{translate(navigationTranslationConstants.browserPreferencesHeading)}</h2>
      </div>
      <SettingsSection>
        <div className="flex wrap items-center gap-large padding-bottom-large">
          <div className="flex flex-col gap-xsmall basis-0 fill">
            <span id={themeModeHeadingId} className="text-title-large content-emphasis">
              {translate(accountInfoTranslationConstants.themeModeHeading)}
            </span>
            <p className="text-body-small content-muted margin-none">
              {translate(accountInfoTranslationConstants.themeModeDescription)}
            </p>
          </div>
          <div className="flex grow basis-0 width-full max-width-[410px]">
            <Dropdown
              value={theme}
              size="Large"
              placeholder=""
              className="width-full"
              aria-labelledby={themeModeHeadingId}
              onValueChange={newTheme => {
                if (!isMode(newTheme)) {
                  return;
                }
                setMode(newTheme);
                setTheme(getMode());
              }}
            >
              <Menu>{options}</Menu>
            </Dropdown>
          </div>
        </div>
      </SettingsSection>
      <AppThemeSetting />
    </div>
  );
};

export default BrowserPreferencesContainer;
