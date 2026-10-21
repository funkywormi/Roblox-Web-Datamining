import { useEffect, useMemo, useState } from "react";
import { arrayIncludes } from "@rbx/core-lib";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  colorModes,
  getColorMode as getColorModeGlobal,
  setColorMode as setColorModeGlobal,
} from "@rbx/core-scripts/color-mode";
import { Dropdown, Menu, MenuSection, MenuItem } from "@rbx/foundation-ui";
import { colorModeTranslations } from "../../constants/theme";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";

const themeModeHeadingId = "app-theme-mode-heading";

export default function ColorModeSetting({ disabled }: { disabled: boolean }) {
  const { translate } = useTranslation();
  const [colorMode, setColorMode] = useState(getColorModeGlobal());
  const options = useMemo(
    () => (
      <Menu>
        <MenuSection>
          {Object.entries(colorModeTranslations).map(([value, translationKey]) => (
            <MenuItem key={value} title={translate(translationKey)} value={value} />
          ))}
        </MenuSection>
      </Menu>
    ),
    [translate],
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setColorMode(getColorModeGlobal());
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
        value={colorMode}
        size="Large"
        placeholder=""
        className="fill basis-0"
        isDisabled={disabled}
        ariaLabelledBy={themeModeHeadingId}
        onValueChange={newColorMode => {
          if (!arrayIncludes(colorModes, newColorMode)) {
            return;
          }
          setColorModeGlobal(newColorMode);
          setColorMode(getColorModeGlobal());
        }}
      >
        {options}
      </Dropdown>
    </section>
  );
}
