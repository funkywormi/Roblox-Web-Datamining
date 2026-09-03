import React, { useEffect, useMemo } from "react";
import { Route } from "react-router-dom";
import { useTranslation } from "react-utilities";
import { EnabledStatusValue, UserSetting } from "@rbx/user-settings";
import useGetSettingsAndOptions from "../../../../apis/hooks/useGetSettingsAndOptions";
import { useGetParentalSpendControlsQuery } from "../../../../apis/billingApi";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import SettingsList from "../../../../common/components/routing/SettingsList";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import { selectChildPagesForChildUserId } from "../../../../apis/slices/childPagesSlice";
import { useAppSelector } from "../../../../redux/hooks";
import ChildMonthlySpendingLimit from "../parentDashboard/ChildMonthlySpendingLimit";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import ChildSpendingNotifications from "../parentDashboard/ChildSpendingNotifications";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { spendingHelpUrl } from "../../../constants/urlConstants";
import ChildAllowPurchases from "../parentDashboard/ChildAllowPurchases";
import { getTranslatedOptionValue } from "../../../constants/contentConstants/consentTranslationConstants";

export const ChildSpendingRestrictionRoutes = ({ child }: { child: TChildInfo }): JSX.Element => {
  const { translate } = useTranslation();
  const childPages = useAppSelector(selectChildPagesForChildUserId(child.userId));
  const { data: spendControlSettings } = useGetParentalSpendControlsQuery(child?.userId);
  const [childSettings] = useGetSettingsAndOptions(child?.userId);
  const { spendControls } = parentalControlsTranslationConstants;

  const spendingPage = childPages?.childSettingCategoryPages[SettingCategoryPageName.Spending];
  const subpages = useMemo(() => {
    const pages = { ...childPages?.spendingPages };
    if (!childSettings?.[UserSetting.enablePurchases]) {
      delete pages[SpendSettingName.AllowPurchases];
    }
    return pages;
  }, [childPages, childSettings]);

  // Fetch labels for current setting values
  const pagesWithCurrentValues: Record<string, TSettingsPage> = useMemo(() => {
    const result: Record<string, TSettingsPage> = {};

    Object.keys(subpages).forEach(key => {
      let currentValueComponent: JSX.Element | undefined;
      let disabled = false;

      switch (key) {
        case SpendSettingName.MonthlySpendingLimit: {
          const spendLimitPriceTag = (
            <span
              className="fiat-spending-limit-tag"
              data-amount={spendControlSettings?.monthlySpendLimit}
              data-currency-code={spendControlSettings?.monthlySpendLimitCurrencyType}
            />
          );
          const noLimit = <span>{translate(spendControls.noLimit)}</span>;
          currentValueComponent =
            spendControlSettings?.monthlySpendLimit !== undefined &&
            spendControlSettings?.monthlySpendLimit !== null
              ? spendLimitPriceTag
              : noLimit;

          disabled =
            childSettings?.[UserSetting.enablePurchases]?.currentValue ===
            EnabledStatusValue.Disabled;
          break;
        }
        case SpendSettingName.SpendNotifications: {
          const optionTranslation = getTranslatedOptionValue(
            spendControlSettings?.spendNotificationSetting,
            translate,
          );
          currentValueComponent = <span>{optionTranslation}</span>;
          disabled =
            childSettings?.[UserSetting.enablePurchases]?.currentValue ===
            EnabledStatusValue.Disabled;
          break;
        }
        case SpendSettingName.AllowPurchases: {
          const optionTranslation = getTranslatedOptionValue(
            childSettings?.[UserSetting.enablePurchases]?.currentValue,
            translate,
          );
          currentValueComponent = <span>{optionTranslation}</span>;
          break;
        }
        default:
      }
      result[key] = {
        ...subpages[key]!,
        currentValueComponent,
        disabled,
      };
    });
    return result;
  }, [subpages, spendControlSettings, childSettings, spendControls]);

  const triggerPriceTagRendering = () => {
    window.dispatchEvent(
      new CustomEvent("price-tag:render", {
        detail: {
          targetSelector: ".fiat-spending-limit-tag",
          tagClassName: "font-body",
        },
      }),
    );
  };
  useEffect(() => {
    triggerPriceTagRendering();
  }, [spendControlSettings, pagesWithCurrentValues]);

  return (
    <div ref={() => triggerPriceTagRendering()}>
      <SettingsList
        subPages={pagesWithCurrentValues}
        routingPath={spendingPage?.path}
        description={
          <span
            dangerouslySetInnerHTML={{
              __html: translate(spendControls.parentSideSpendSettingsDescripion, {
                linkStart: `<a class=text-link href=${spendingHelpUrl}>`,
                linkEnd: "</a>",
                lineBreak: "<br><br>",
              }),
            }}
          />
        }
      />

      {childSettings?.[UserSetting.enablePurchases] && (
        <Route path={subpages[SpendSettingName.AllowPurchases]?.path}>
          <ChildAllowPurchases child={child} />
        </Route>
      )}

      <Route path={subpages[SpendSettingName.MonthlySpendingLimit]?.path}>
        <ChildMonthlySpendingLimit child={child} />
      </Route>
      <Route path={subpages[SpendSettingName.SpendNotifications]?.path}>
        <ChildSpendingNotifications child={child} />
      </Route>
    </div>
  );
};

export default ChildSpendingRestrictionRoutes;
