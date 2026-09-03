import { Fragment } from "react";

import { BenefitItem } from "./BenefitList";

import type { SectionSubscriptionBenefit } from "../../types/sectionSubscriptionV2";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

/** Shown on small viewports; compact row includes only these icons, in this order. */
const COMPACT_BENEFIT_ICONS = [
  "icon-regular-tag",
  "icon-regular-controller",
  "icon-regular-robux",
] as const;

const COMPACT_BENEFIT_ICON_ORDER = COMPACT_BENEFIT_ICONS as readonly string[];

/** Shown on large viewports; two rows of benefits. This list is split in half
 * and runs top down, left to right.
 **/
const LARGE_BENEFIT_ICON_ORDER = [
  "icon-regular-tag",
  "icon-regular-tag-arrow-up",
  "icon-regular-controller",
  "icon-regular-robux",
  "icon-regular-hand-two-arrows-horizontal",
  "icon-regular-arrow-up-from-landscape-rectangle",
] as readonly string[];

function mapServerBenefitIcon(iconName: string): TTailwindIconClass {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- server-driven icon name
  return iconName as TTailwindIconClass;
}

function isCompactBenefitIcon(iconName: string): boolean {
  return COMPACT_BENEFIT_ICON_ORDER.includes(iconName);
}

function largeBenefitIconSortKey(iconName: string): number {
  const i = LARGE_BENEFIT_ICON_ORDER.indexOf(iconName);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

function compactBenefitIconSortKey(iconName: string): number {
  const i = COMPACT_BENEFIT_ICON_ORDER.indexOf(iconName);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

export type SubscriptionBenefitTranslate = (
  key: string,
  params?: Record<string, string | number>,
) => string;

const PERIOD_TYPE_TO_PLURAL: Record<string, string> = {
  PERIOD_TYPE_WEEK: "weeks",
  PERIOD_TYPE_MONTH: "months",
  PERIOD_TYPE_YEAR: "years",
};

type FieldTransform = {
  rename?: string;
  mapValue?: (v: string | number) => string | number;
};

// Maps backend field names to their frontend translation param equivalents.
const BENEFIT_FIELD_TRANSFORMS: Record<string, FieldTransform> = {
  discountPercentage: { rename: "discountPercent" },
  periodType: { mapValue: v => PERIOD_TYPE_TO_PLURAL[String(v)] ?? String(v) },
};

/**
 * Some benefits have extra metadata that help define the translation string.
 * In those cases, we need to take the metadata and pass it to the translate
 * function.
 */
function getBenefitTranslationParams(
  benefit: SectionSubscriptionBenefit,
): Record<string, string | number> | undefined {
  const params: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(benefit)) {
    if (key === "iconName" || key === "benefitTranslationKey") {
      continue;
    }
    if (typeof value === "object") {
      for (const [field, fieldValue] of Object.entries(value as Record<string, string | number>)) {
        const transform = BENEFIT_FIELD_TRANSFORMS[field];
        const paramName = transform?.rename ?? field;
        const paramValue = transform?.mapValue ? transform.mapValue(fieldValue) : fieldValue;
        params[paramName] = paramValue;
      }
    }
  }

  return Object.keys(params).length > 0 ? params : undefined;
}

export type CompactBenefitListProps = {
  benefits: SectionSubscriptionBenefit[];
  translate: SubscriptionBenefitTranslate;
};

/** Up to three benefits in one row; only payload rows whose icon is in COMPACT_BENEFIT_ICONS; order follows that list. */
export function CompactBenefitList({ benefits, translate }: CompactBenefitListProps) {
  const compactBenefits = benefits
    .filter(b => isCompactBenefitIcon(b.iconName))
    .sort((a, b) => compactBenefitIconSortKey(a.iconName) - compactBenefitIconSortKey(b.iconName));

  return (
    <Fragment>
      {compactBenefits.map((b, index) => (
        <BenefitItem
          key={`compact-${b.benefitTranslationKey}-${String(index)}`}
          iconName={mapServerBenefitIcon(b.iconName)}
          label={translate(b.benefitTranslationKey, getBenefitTranslationParams(b))}
        />
      ))}
    </Fragment>
  );
}

export type LargeScreenBenefitListProps = {
  benefits: SectionSubscriptionBenefit[];
  translate: SubscriptionBenefitTranslate;
};

/** Two columns (up to three benefits each); server icons; labels from payload. */
export function LargeScreenBenefitList({ benefits, translate }: LargeScreenBenefitListProps) {
  if (benefits.length === 0) {
    return null;
  }

  const sortedBenefits = benefits.toSorted(
    (a, b) => largeBenefitIconSortKey(a.iconName) - largeBenefitIconSortKey(b.iconName),
  );

  const half = Math.ceil(sortedBenefits.length / 2);
  const leftColumn = sortedBenefits.slice(0, half);
  const rightColumn = sortedBenefits.slice(half);

  return (
    <div className="gap-x-large gap-y-large width-full grid [grid-template-columns:repeat(2,minmax(0,1fr))]">
      <div className="gap-y-large min-width-0 flex flex-col">
        {leftColumn.map((b, i) => (
          <BenefitItem
            key={`lg-left-${b.benefitTranslationKey}-${String(i)}`}
            iconName={mapServerBenefitIcon(b.iconName)}
            label={translate(b.benefitTranslationKey, getBenefitTranslationParams(b))}
          />
        ))}
      </div>
      <div className="gap-y-large min-width-0 flex flex-col">
        {rightColumn.map((b, i) => (
          <BenefitItem
            key={`lg-right-${b.benefitTranslationKey}-${String(i)}`}
            iconName={mapServerBenefitIcon(b.iconName)}
            label={translate(b.benefitTranslationKey, getBenefitTranslationParams(b))}
          />
        ))}
      </div>
    </div>
  );
}
