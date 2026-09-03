import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  getTheme as getThemeGlobal,
  setTheme as setThemeGlobal,
  setPreviewTheme,
  clearPreviewTheme,
  subscribeToThemeChange,
} from "@rbx/core-scripts/theme";
import { TUpdateUserSettingValueRequest, UserSetting } from "@rbx/user-settings";
import SettingsSection from "../../../common/components/SettingsSection";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { AppThemesAccess } from "../../../../types/policyTypes";
import browserPreferencesTranslationConstants from "../../constants/contentConstants/browserPreferencesTranslationConstants";
import {
  appThemeDefByKey,
  appThemeDefs,
  defaultAppTheme,
  type AppThemeCategoryId,
  type AppThemeDef,
} from "../../constants/appThemes";
import appThemeEventService from "../../services/eventServices/appThemeEventService";
import AppThemeCard from "./AppThemeCard";
import AppThemeCategoryTabs from "./AppThemeCategoryTabs";
import AppThemeHeader from "./AppThemeHeader";
import AppThemeUpsellBanner from "./AppThemeUpsellBanner";
import AppThemeUpsellSheet from "./AppThemeUpsellSheet";

const constants = browserPreferencesTranslationConstants;

// Mounted only once the initial theme is known, so state seeds from it directly.
function AppThemePicker({
  isSubscriber,
  isEligible,
}: {
  isSubscriber: boolean;
  isEligible: boolean;
}) {
  const { translate } = useTranslation();
  const [updateSettingValue, { isLoading: isUpdating }] = useUpdateUserSettingValueMutation();

  const [theme, setTheme] = useState(appThemeDefByKey.get(getThemeGlobal()) ?? null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<AppThemeCategoryId>(
    theme?.category ?? "dynamic",
  );
  const [upsellOpen, setUpsellOpen] = useState(false);

  // Non-subscribers only preview; discard on unmount since it's never saved.
  useEffect(() => {
    if (!isEligible) {
      return undefined;
    }
    return () => clearPreviewTheme();
  }, [isEligible]);

  // Read when the exit fires, so a user who converts in place isn't logged as abandoning.
  const isSubscriberRef = useRef(isSubscriber);
  isSubscriberRef.current = isSubscriber;
  const sawUpsellRef = useRef(false);
  if (isEligible) {
    sawUpsellRef.current = true;
  }

  const hasFiredBannerShown = useRef(false);
  useEffect(() => {
    if (!isEligible || hasFiredBannerShown.current) {
      return;
    }
    hasFiredBannerShown.current = true;
    appThemeEventService.upsellBannerShown(isSubscriber);
  }, [isEligible, isSubscriber]);

  // Unmount misses full-page exits: the checkout hand-off, a nav link, or closing the tab.
  const hasFiredExitRef = useRef(false);
  useEffect(() => {
    const fireExit = () => {
      if (hasFiredExitRef.current || !sawUpsellRef.current) {
        return;
      }
      hasFiredExitRef.current = true;
      appThemeEventService.devicePreferencesExit(isSubscriberRef.current);
    };
    window.addEventListener("pagehide", fireExit);
    window.addEventListener("beforeunload", fireExit);
    return () => {
      window.removeEventListener("pagehide", fireExit);
      window.removeEventListener("beforeunload", fireExit);
      fireExit();
    };
  }, []);

  // Guard against a fast second click before `isUpdating` disables the cards on re-render.
  const isPersistingRef = useRef(false);

  // The theme can change on another device, so follow core-scripts or the cards go stale.
  useEffect(() => {
    if (!isSubscriber) {
      return undefined;
    }
    return subscribeToThemeChange(theme => {
      // Our own save already moved the selection, and its echo carries the same theme.
      if (isPersistingRef.current) {
        return;
      }
      const def = appThemeDefByKey.get(theme);
      if (def == null) {
        return;
      }
      setTheme(def);
      // Reveal the new selection even if the user is browsing the other category.
      setSelectedCategoryId(def.category);
    });
  }, [isSubscriber]);

  const onSelect = async (newTheme: AppThemeDef) => {
    if (isPersistingRef.current || newTheme.key === theme?.key) {
      return;
    }

    if (!isSubscriber) {
      if (newTheme.key === "default") {
        clearPreviewTheme();
      } else {
        setPreviewTheme(newTheme.key);
      }
      setTheme(newTheme);
      appThemeEventService.themeSelected(isSubscriber, newTheme.accountTheme);
      return;
    }

    isPersistingRef.current = true;
    const previousTheme = theme;
    const previousThemeGlobal = getThemeGlobal();
    setTheme(newTheme);
    setThemeGlobal(newTheme.key);

    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.accountTheme,
      value: newTheme.accountTheme,
    };
    try {
      await updateSettingValue(updateBody).unwrap();
    } catch {
      if (previousTheme == null) {
        setTheme(null);
        if (previousThemeGlobal !== "kids") {
          setThemeGlobal(previousThemeGlobal);
        }
      } else {
        setTheme(previousTheme);
        setThemeGlobal(previousTheme.key);
      }
    } finally {
      isPersistingRef.current = false;
    }
  };

  const subtitle = isSubscriber
    ? translate(constants.appThemeDescription)
    : translate(constants.appThemeUpsellDescription);

  const visibleThemes = useMemo(
    () => [defaultAppTheme, ...appThemeDefs.filter(def => def.category === selectedCategoryId)],
    [selectedCategoryId],
  );

  return (
    <SettingsSection>
      <div className="app-theme-section flex flex-col gap-large">
        <AppThemeHeader subtitle={subtitle} />
        {isEligible && (
          <AppThemeUpsellBanner
            onSubscribe={() => {
              appThemeEventService.upsellSubscribeClick(isSubscriber);
              setUpsellOpen(true);
            }}
          />
        )}
        <AppThemeCategoryTabs
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
        <div className="grid gap-medium [grid-template-columns:repeat(2,minmax(0,1fr))]">
          {visibleThemes.map(def => (
            <AppThemeCard
              key={def.key}
              def={def}
              selected={def.key === theme?.key}
              disabled={isUpdating}
              onSelect={onSelect}
            />
          ))}
        </div>
        {isEligible && <AppThemeUpsellSheet open={upsellOpen} onOpenChange={setUpsellOpen} />}
      </div>
    </SettingsSection>
  );
}

export default function AppThemeSetting() {
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();

  const isSubscriber = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Enabled;
  const isEligible = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Eligible;

  if (!isSubscriber && !isEligible) {
    return null;
  }

  return <AppThemePicker isSubscriber={isSubscriber} isEligible={isEligible} />;
}
