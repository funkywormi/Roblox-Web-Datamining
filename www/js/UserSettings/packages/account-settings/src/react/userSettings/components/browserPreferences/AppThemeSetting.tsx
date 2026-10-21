import { useEffect, useMemo, useRef, useState } from "react";
import * as localStorage from "@rbx/core-lib/local-storage";
import { getCurrentUser } from "@rbx/www-common/user";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  getTheme as getThemeGlobal,
  setTheme as setThemeGlobal,
  setPreviewTheme,
  clearPreviewTheme,
  subscribeToThemeChange,
  setListeningToThemeChanges,
  AppTheme,
} from "@rbx/core-scripts/theme";
import { Badge, Chip, Icon } from "@rbx/foundation-ui";
import { UserSetting } from "@rbx/user-settings";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { useGetPlusSubscriptionProductQuery } from "../../../apis/subscriptionsApi";
import { AppThemesAccess } from "../../../../types/policyTypes";
import {
  appThemeLabel,
  newBadgeLabel,
} from "../../constants/contentConstants/browserPreferencesTranslationConstants";
import { appThemeCategories, AppThemeCategoryId, AppThemeDef } from "../../constants/appThemes";
import appThemeEventService from "../../services/eventServices/appThemeEventService";
import AppThemeCard from "./AppThemeCard";
import AppThemeUpsellBanner from "./AppThemeUpsellBanner";
import AppThemeUpsellSheet from "./AppThemeUpsellSheet";

const ThemeGrid = ({
  selectedTheme,
  themes,
  disabled,
  onSelect,
}: {
  selectedTheme: AppThemeDef | null;
  themes: AppThemeDef[];
  disabled: boolean;
  onSelect: (theme: AppThemeDef) => void;
}) => {
  return (
    <div className="grid gap-medium [grid-template-columns:repeat(2,minmax(0,1fr))]">
      {themes.map(theme => (
        <AppThemeCard
          key={theme.key}
          theme={theme}
          selected={theme.key === selectedTheme?.key}
          disabled={disabled}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

const AppThemeSettingSection = ({
  theme,
  setTheme,
  themes,
  themesByKey,
  isPlus,
  isEligible,
}: {
  theme: AppThemeDef | null;
  setTheme: (theme: AppThemeDef | null) => void;
  themes: AppThemeDef[];
  themesByKey: Map<AppTheme, AppThemeDef>;
  isPlus: boolean;
  isEligible: boolean;
}) => {
  const { translate } = useTranslation();
  const [updateSettingValue, { isLoading }] = useUpdateUserSettingValueMutation();
  const [category, setCategory] = useState<AppThemeCategoryId>(theme?.category ?? "dynamic");
  const [upsellOpen, setUpsellOpen] = useState(false);
  // Prefetched with the banner so its CTA knows about a trial; the sheet reuses the cache.
  const { data: plusProduct, isLoading: isPlusProductLoading } = useGetPlusSubscriptionProductQuery(
    undefined,
    { skip: !isEligible },
  );

  useEffect(() => clearPreviewTheme, []);

  const freeThemes = useMemo(() => themes.filter(theme => theme.category == null), [themes]);

  useEffect(() => {
    if (!isPlus && freeThemes.length <= 1) {
      return;
    }
    return subscribeToThemeChange(key => {
      const theme = themesByKey.get(key);
      if (theme == null) {
        return;
      }
      setTheme(theme);
      if (theme.category) {
        setCategory(theme.category);
      }
    });
  }, [themesByKey, isPlus, setTheme, freeThemes.length]);

  const hasFiredExitRef = useRef(false);
  const sawUpsell = useRef(false);
  const isPlusRef = useRef(isPlus);
  isPlusRef.current = isPlus;
  useEffect(() => {
    const onExit = () => {
      if (hasFiredExitRef.current || !sawUpsell.current) {
        return;
      }
      hasFiredExitRef.current = true;
      appThemeEventService.devicePreferencesExit(isPlusRef.current);
    };

    window.addEventListener("pagehide", onExit);
    window.addEventListener("beforeunload", onExit);
    return () => {
      window.removeEventListener("pagehide", onExit);
      window.removeEventListener("beforeunload", onExit);
      onExit();
    };
  }, []);

  const themesInCategory = useMemo(
    () => themes.filter(theme => theme.category === category),
    [themes, category],
  );

  const onSelect = (newTheme: AppThemeDef) => {
    if (isLoading || newTheme.key === theme?.key) {
      return;
    }
    if (!isPlus) {
      if (newTheme.category == null) {
        const id = getCurrentUser()?.id;
        const localStorageKey = "event-halloween-2026";
        const hollowEvent = localStorage.getItem(localStorageKey) ?? {
          version: 0,
          data: [],
        };
        if (id != null && hollowEvent.version === 0) {
          if (newTheme.key === "halloween-2026") {
            if (!hollowEvent.data.includes(id)) {
              hollowEvent.data.push(id);
              localStorage.setItem(localStorageKey, hollowEvent);
            }
          } else {
            const users = hollowEvent.data.filter(x => x !== id);
            localStorage.setItem(localStorageKey, { version: 0, data: users });
          }
        }
        clearPreviewTheme();
        setThemeGlobal(newTheme.key);
      } else {
        setPreviewTheme(newTheme.key);
      }
      setTheme(newTheme);
      appThemeEventService.themeSelected(isPlus, newTheme.accountTheme);
      return;
    }

    setListeningToThemeChanges(false);
    const previousTheme = theme;
    const previousThemeGlobal = getThemeGlobal();
    setTheme(newTheme);
    setThemeGlobal(newTheme.key);
    updateSettingValue({
      setting: UserSetting.accountTheme,
      value: newTheme.accountTheme,
    })
      .unwrap()
      .catch(() => {
        if (previousTheme == null) {
          setTheme(null);
          setThemeGlobal(previousThemeGlobal);
        } else {
          setTheme(previousTheme);
          setThemeGlobal(previousTheme.key);
        }
      })
      .finally(() => {
        setListeningToThemeChanges(true);
      });
  };

  return (
    <section className="flex flex-col gap-large">
      <div className="flex flex-col gap-xsmall">
        <h3 className="text-title-large content-emphasis padding-none">
          {translate(appThemeLabel)}
        </h3>
        <p className="text-body-small content-muted margin-none">
          {translate("Description.DeviceAppThemeExclusive")}
        </p>
      </div>
      <ThemeGrid
        themes={freeThemes}
        selectedTheme={theme}
        disabled={isLoading}
        onSelect={onSelect}
      />
      {isPlus || isEligible ? (
        <section className="flex flex-col gap-medium">
          <div className="flex items-center gap-small">
            <Icon name="icon-regular-roblox-plus" size="Medium" />
            <h4 className="text-title-large content-emphasis padding-none">
              {translate("Heading.ExclusiveThemes")}
            </h4>
            <Badge variant="Contrast" shape="Box" size="XSmall" label={translate(newBadgeLabel)} />
          </div>
          {isEligible && (
            <div className="flex gap-medium">
              <div className="fill basis-0">
                <AppThemeUpsellBanner
                  eligibleOffers={plusProduct?.eligibleOffers}
                  isLoading={isPlusProductLoading}
                  onFirstMount={() => {
                    sawUpsell.current = true;
                    appThemeEventService.upsellBannerShown(isPlus);
                  }}
                  onSubscribe={() => {
                    appThemeEventService.upsellSubscribeClick(isPlus);
                    setUpsellOpen(true);
                  }}
                />
              </div>
              <div className="fill basis-0" />
            </div>
          )}
          <div className="flex wrap gap-small" role="group" aria-label={translate(appThemeLabel)}>
            {appThemeCategories.map(c => (
              <Chip
                key={c.id}
                size="Medium"
                text={translate(c.labelKey)}
                isChecked={c.id === category}
                onCheckedChange={() => setCategory(c.id)}
              />
            ))}
          </div>
          <ThemeGrid
            themes={themesInCategory}
            selectedTheme={theme}
            disabled={isLoading}
            onSelect={onSelect}
          />
          {isEligible && <AppThemeUpsellSheet open={upsellOpen} onOpenChange={setUpsellOpen} />}
        </section>
      ) : null}
    </section>
  );
};

export default function AppThemeSetting({
  theme,
  setTheme,
  themes,
  themesByKey,
}: {
  theme: AppThemeDef | null;
  setTheme: (theme: AppThemeDef | null) => void;
  themes: AppThemeDef[];
  themesByKey: Map<AppTheme, AppThemeDef>;
}) {
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();
  const isPlus = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Enabled;
  const isEligible = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Eligible;
  if (settingsUiPolicy == null || (!isPlus && !isEligible)) {
    return null;
  }
  return (
    <AppThemeSettingSection
      theme={theme}
      setTheme={setTheme}
      themes={themes}
      themesByKey={themesByKey}
      isPlus={isPlus}
      isEligible={isEligible}
    />
  );
}
