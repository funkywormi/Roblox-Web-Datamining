import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  getTheme,
  setTheme,
  setPreviewTheme,
  clearPreviewTheme,
  subscribeToThemeChange,
  type AppTheme,
} from "@rbx/core-scripts/theme";
import { TUpdateUserSettingValueRequest, UserSetting } from "@rbx/user-settings";
import SettingsSection from "../../../common/components/SettingsSection";
import useGetSettingsAndOptions from "../../../apis/hooks/useGetSettingsAndOptions";
import { useUpdateUserSettingValueMutation } from "../../../apis/userSettingsApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import { AppThemesAccess } from "../../../../types/policyTypes";
import browserPreferencesTranslationConstants from "../../constants/contentConstants/browserPreferencesTranslationConstants";
import {
  appThemeDefByAccountTheme,
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
  initialThemeDef,
}: {
  isSubscriber: boolean;
  isEligible: boolean;
  initialThemeDef: AppThemeDef;
}) {
  const { translate } = useTranslation();
  const [updateSettingValue, { isLoading: isUpdating }] = useUpdateUserSettingValueMutation();

  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(initialThemeDef.key);
  const [selectedCategoryId, setSelectedCategoryId] = useState<AppThemeCategoryId>(
    initialThemeDef.category,
  );
  const [upsellOpen, setUpsellOpen] = useState(false);

  // Apply the saved theme once on mount; skip if the page already has it (e.g. settings API failed).
  const initialKeyRef = useRef(initialThemeDef.key);
  useEffect(() => {
    if (isSubscriber && getTheme() !== initialKeyRef.current) {
      setTheme(initialKeyRef.current);
    }
  }, [isSubscriber]);

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
      setSelectedTheme(def.key);
      // Reveal the new selection even if the user is browsing the other category.
      setSelectedCategoryId(def.category);
    });
  }, [isSubscriber]);

  const onSelect = async ({ key, accountTheme }: AppThemeDef) => {
    if (isPersistingRef.current || key === selectedTheme) {
      return;
    }

    if (!isSubscriber) {
      setPreviewTheme(key);
      setSelectedTheme(key);
      appThemeEventService.themeSelected(isSubscriber, accountTheme);
      return;
    }

    isPersistingRef.current = true;
    const previousTheme = selectedTheme;
    setTheme(key);
    setSelectedTheme(key);

    const updateBody: TUpdateUserSettingValueRequest = {
      setting: UserSetting.accountTheme,
      value: accountTheme,
    };
    try {
      await updateSettingValue(updateBody).unwrap();
    } catch {
      setTheme(previousTheme);
      setSelectedTheme(previousTheme);
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
              selected={def.key === selectedTheme}
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
  const [settingsAndOptions, settingsStatus] = useGetSettingsAndOptions();

  const isSubscriber = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Enabled;
  const isEligible = settingsUiPolicy?.appThemesAccess === AppThemesAccess.Eligible;

  if (!isSubscriber && !isEligible) {
    return null;
  }

  // Ready once resolved; `data` stays set through a save's refetch, so the picker keeps state.
  const settingsLoaded =
    settingsAndOptions != null ||
    settingsStatus === QueryStatus.fulfilled ||
    settingsStatus === QueryStatus.rejected;

  if (isSubscriber && !settingsLoaded) {
    return null;
  }

  const persistedAccountTheme = settingsAndOptions?.[UserSetting.accountTheme]?.currentValue;
  const initialThemeDef = (() => {
    if (!isSubscriber) {
      return defaultAppTheme;
    }
    if (persistedAccountTheme) {
      return appThemeDefByAccountTheme.get(persistedAccountTheme.toLowerCase()) ?? defaultAppTheme;
    }
    // Settings unavailable (e.g. transient API failure): seed from the theme already on the page.
    return appThemeDefByKey.get(getTheme()) ?? defaultAppTheme;
  })();

  return (
    <AppThemePicker
      isSubscriber={isSubscriber}
      isEligible={isEligible}
      initialThemeDef={initialThemeDef}
    />
  );
}
