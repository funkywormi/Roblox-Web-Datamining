import { ValueOf } from "@rbx/core-types";
import "@rbx/core-scripts/global";
import {
  withTranslations,
  renderWithErrorBoundary,
  WithTranslationsProps,
} from "@rbx/core-scripts/react";
import { createElement } from "react";
import {
  VerifiedBadgeTextContainer,
  verifiedBadgeTextContainerReactRenderClass,
  verifiedBadgeIconReactRenderClass,
  VerifiedBadgeIcon,
  BadgeSizes,
} from "@rbx/badge-components";
import { VerifiedBadgeIconProps } from "@rbx/badge-components/types/components/VerifiedBadgeIcon";
import { VerifiedBadgeTextContainerProps } from "@rbx/badge-components/types/containers/VerifiedBadgeTextContainer";
import "@rbx/badge-components/styles/badgeStyles.scss";
import { translations } from "../component.json";
import { fetchTranslations } from "./verifiedBadgeTranslations";

export { BadgeSizes, fetchTranslations };

export const currentUserHasVerifiedBadge = () =>
  window.Roblox.CurrentUser?.hasVerifiedBadge ?? false;

const iconPropsAttrMap = {
  additionalcontainerclass: "additionalContainerClass",
  overridecontainerclass: "overrideContainerClass",
  additionalimgclass: "additionalImgClass",
  overrideimgclass: "overrideImgClass",
} as const;

const stringContainerPropsAttrMap = {
  // showverifiedbadge: "showVerifiedBadge",
  text: "text",
  overridetextcontainerclass: "overrideTextContainerClass",
  overridewrapperclass: "overrideWrapperClass",
  additionaltextcontainerclass: "additionalTextContainerClass",
  additionalwrapperclass: "additionalWrapperClass",
} as const;

const VerifiedBadgeIconContainerNoTranslations = ({
  titleText,
  translate,
  ...props
}: Omit<VerifiedBadgeIconProps, "titleText"> & { titleText?: string } & WithTranslationsProps) => (
  <VerifiedBadgeIcon
    {...props}
    titleText={titleText ?? translate("Creator.VerifiedBadgeIconAccessibilityText")}
  />
);

export const VerifiedBadgeIconContainer = withTranslations(
  VerifiedBadgeIconContainerNoTranslations,
  translations,
);

const VerifiedBadgeStringContainerNoTranslations = ({
  titleText,
  translate,
  ...props
}: Omit<VerifiedBadgeTextContainerProps, "titleText"> & {
  titleText?: string;
} & WithTranslationsProps) => (
  <VerifiedBadgeTextContainer
    {...props}
    titleText={titleText ?? translate("Creator.VerifiedBadgeIconAccessibilityText")}
  />
);

export const VerifiedBadgeStringContainer = withTranslations(
  VerifiedBadgeStringContainerNoTranslations,
  translations,
);

export const initRobloxBadgesFrameworkAgnostic = async ({
  overrideIconClass,
  overrideContainerClass,
}: {
  overrideIconClass?: string;
  overrideContainerClass?: string;
} = {}) => {
  // Preserving public API and loading behavior/order
  await Promise.resolve();
  try {
    const verifiedBadgeTextContainers = document.querySelectorAll<HTMLElement>(
      `.${overrideContainerClass ?? verifiedBadgeTextContainerReactRenderClass}`,
    );

    const verifiedBadges = document.querySelectorAll<HTMLElement>(
      `.${overrideIconClass ?? verifiedBadgeIconReactRenderClass}`,
    );

    const { translatedVerifiedBadgeTitleText } = fetchTranslations();

    for (const verifiedBadgeTextContainerEl of verifiedBadgeTextContainers) {
      const data = verifiedBadgeTextContainerEl.dataset;
      const verifiedBadgeTextContainerProps: VerifiedBadgeTextContainerProps = {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        size: data.size as BadgeSizes,
        titleText: translatedVerifiedBadgeTitleText,
      };

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const map = stringContainerPropsAttrMap as Record<
        string,
        ValueOf<typeof stringContainerPropsAttrMap>
      >;
      for (const [k, v] of Object.entries(data)) {
        const propName = map[k];
        if (propName) {
          verifiedBadgeTextContainerProps[propName] = v;
        }
      }

      const elToRender = document.createElement("span");
      const reactElToRender = createElement(
        VerifiedBadgeStringContainer,
        verifiedBadgeTextContainerProps,
      );
      renderWithErrorBoundary(reactElToRender, elToRender);
      verifiedBadgeTextContainerEl.parentNode?.replaceChild(
        elToRender,
        verifiedBadgeTextContainerEl,
      );
    }

    for (const verifiedBadge of verifiedBadges) {
      const data = verifiedBadge.dataset;
      const verifiedBadgeIconProps: VerifiedBadgeIconProps = {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        size: data.size as BadgeSizes,
        titleText: translatedVerifiedBadgeTitleText,
      };

      for (const [k, v] of Object.entries(data)) {
        const propName =
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          (iconPropsAttrMap as Record<string, ValueOf<typeof iconPropsAttrMap>>)[k];
        if (propName) {
          verifiedBadgeIconProps[propName] = v;
        }
      }

      const iconToRender = document.createElement("span");
      const reactElToRender = createElement(VerifiedBadgeIcon, verifiedBadgeIconProps);
      renderWithErrorBoundary(reactElToRender, iconToRender);
      verifiedBadge.parentNode?.replaceChild(iconToRender, verifiedBadge);
    }
  } catch (e) {
    console.error("Failed to initialize roblox badges:", e);
  }
};
