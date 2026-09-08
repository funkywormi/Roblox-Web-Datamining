import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  type Mode,
  getMode as getModeGlobal,
  setMode as setModeGlobal,
} from "@rbx/core-scripts/color-mode";
import { Dropdown, Menu, MenuSection, MenuItem } from "@rbx/foundation-ui";
import { modeTranslations } from "../../constants/theme";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";

const themeModeHeadingId = "app-theme-mode-heading";

const isMode = (value: string): value is Mode => value in modeTranslations;

export default function ColorModeSetting() {
  const { translate } = useTranslation();
  const [mode, setMode] = useState(getModeGlobal());
  const options = useMemo(
    () => (
      <Menu>
        <MenuSection>
          {Object.entries(modeTranslations).map(([value, translationKey]) => (
            <MenuItem key={value} title={translate(translationKey)} value={value} />
          ))}
        </MenuSection>
      </Menu>
    ),
    [translate],
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(getModeGlobal());
    });
    observer.observe(document.body, { attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="flex items-center gap-large">
      <div className="fill basis-0 flex flex-col gap-xsmall">
        <h3 id={themeModeHeadingId} className="text-title-large content-emphasis padding-none">
          {translate(accountInfoTranslationConstants.themeModeHeading)}
        </h3>
        <p className="text-body-small content-muted margin-none">
          {translate(accountInfoTranslationConstants.themeModeDescription)}
        </p>
      </div>
      <Dropdown
        value={mode}
        size="Large"
        placeholder=""
        className="fill basis-0"
        ariaLabelledBy={themeModeHeadingId}
        onValueChange={newMode => {
          if (!isMode(newMode)) {
            return;
          }
          setModeGlobal(newMode);
          setMode(getModeGlobal());
        }}
      >
        {options}
      </Dropdown>
    </section>
  );
}
