import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observeChildrenVisibility } from "@rbx/core-scripts/util/element-visibility";
import { ROOT_ELEMENT_ID } from "../constants";
import { SectionBase } from "../types/buyRobuxPageData";

// 50% threshold balances reliability with avoiding false positives
// Lower than 65% because section elements can be tall (include banners)
const INTERSECTION_THRESHOLD = 0.5;
const DEBOUNCE_DELAY = 250; // ms

// Identity attributes set by tracked DOM nodes. The intersection observer
// reads identity from these so we never depend on DOM render order matching
// the order of any source-data array. Any element on the page can opt in to
// tracking by carrying one of these attributes (e.g., a Section, a button in
// the Header).
const SECTION_TYPE_ATTR = "data-section-type";
const PRODUCT_ID_ATTR = "data-product-id";
// Subscription products carry both an id and a product-type (e.g., PRODUCT_TYPE_ROBLOX_PLUS)
const SUBSCRIPTION_PRODUCT_ID_ATTR = "data-subscription-product-id";
const SUBSCRIPTION_PRODUCT_TYPE_ATTR = "data-subscription-product-type";

// Single source of truth for which attributes mark a tracked element. The
// observer's dispatch table and the query selector both derive from this so
// adding a new tracked entity type is a one-line change here plus a new
// dispatch entry.
const TRACKING_IDENTITY_ATTRS = [
  SECTION_TYPE_ATTR,
  PRODUCT_ID_ATTR,
  SUBSCRIPTION_PRODUCT_ID_ATTR,
] as const;
const TRACKING_SELECTOR = TRACKING_IDENTITY_ATTRS.map(attr => `[${attr}]`).join(", ");

export type SeenSubscriptionProduct = {
  subscriptionProductId: string;
  subscriptionProductType: string;
};

export type ImpressionData = {
  seenProducts: string[];
  seenSections: string[];
  seenSubscriptionProducts: SeenSubscriptionProduct[];
};

/**
 * Tag any element as a section impression target. Spread the result onto the
 * element you want tracked — typically the wrapping `<Section>`, but also
 * standalone elements rendered outside the section list (e.g., a button in
 * the Header for a section that lives there instead).
 */
export function getSectionTrackingProps(sectionBase: SectionBase) {
  return { [SECTION_TYPE_ATTR]: sectionBase.sectionType } as const;
}

/**
 * Tag any element as a product impression target. Spread the result onto the
 * element representing a single purchasable product.
 */
export function getRobuxProductTrackingProps(productId: string) {
  return { [PRODUCT_ID_ATTR]: productId } as const;
}

/**
 * Tag any element as a subscription product impression target. Subscription
 * impressions are tracked separately from Robux products because the
 * product-type discriminator (e.g., PRODUCT_TYPE_ROBLOX_PLUS) needs to flow
 * through to analytics alongside the id.
 */
export function getSubscriptionProductTrackingProps(
  subscriptionProductId: string,
  subscriptionProductType: string,
) {
  return {
    [SUBSCRIPTION_PRODUCT_ID_ATTR]: subscriptionProductId,
    [SUBSCRIPTION_PRODUCT_TYPE_ATTR]: subscriptionProductType,
  } as const;
}

/**
 * Simple debounce utility following the pattern from discovery-common
 */
function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  timeout: number,
): [(...args: T) => void, () => void] {
  let timer: ReturnType<typeof setTimeout>;
  return [
    (...args: T) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, timeout);
    },
    () => {
      clearTimeout(timer);
    },
  ];
}

export function useScrollTracking(): ImpressionData {
  // Track seen items by their string identifier (section type / product id) so
  // we don't conflate position-in-DOM with position-in-data-array. Sets are
  // refs because we want stability across renders without re-running effects.
  const seenSectionTypesRef = useRef<Set<string>>(new Set());
  const seenProductIdsRef = useRef<Set<string>>(new Set());
  // Map keyed by subscription product id so the same product can't be counted
  // twice while still preserving its product type for downstream analytics.
  const seenSubscriptionProductsRef = useRef<Map<string, string>>(new Map());

  const [impressionData, setImpressionData] = useState<ImpressionData>({
    seenProducts: [],
    seenSections: [],
    seenSubscriptionProducts: [],
  });

  const updateImpressions = useCallback(() => {
    setImpressionData({
      seenProducts: [...seenProductIdsRef.current],
      seenSections: [...seenSectionTypesRef.current],
      seenSubscriptionProducts: Array.from(
        seenSubscriptionProductsRef.current,
        ([subscriptionProductId, subscriptionProductType]) => ({
          subscriptionProductId,
          subscriptionProductType,
        }),
      ),
    });
  }, []);

  const [debouncedUpdateImpressions, cancelUpdateImpressions] = useMemo(
    () => debounce(updateImpressions, DEBOUNCE_DELAY),
    [updateImpressions],
  );

  // Dispatch table keyed by the identity attribute. Each handler reads any
  // additional attributes it needs from the same element and returns whether
  // a new impression was recorded. Adding a new tracked entity type is a
  // single new entry here plus a new field in `updateImpressions` — the
  // observer loop itself doesn't change.
  const trackingHandlers = useMemo(
    (): { attr: string; record: (target: Element) => boolean }[] => [
      {
        attr: SECTION_TYPE_ATTR,
        record: target => {
          const sectionType = target.getAttribute(SECTION_TYPE_ATTR);
          if (!sectionType || seenSectionTypesRef.current.has(sectionType)) {
            return false;
          }
          seenSectionTypesRef.current.add(sectionType);
          return true;
        },
      },
      {
        attr: PRODUCT_ID_ATTR,
        record: target => {
          const productId = target.getAttribute(PRODUCT_ID_ATTR);
          if (!productId || seenProductIdsRef.current.has(productId)) {
            return false;
          }
          seenProductIdsRef.current.add(productId);
          return true;
        },
      },
      {
        attr: SUBSCRIPTION_PRODUCT_ID_ATTR,
        record: target => {
          const subscriptionProductId = target.getAttribute(SUBSCRIPTION_PRODUCT_ID_ATTR);
          if (
            !subscriptionProductId ||
            seenSubscriptionProductsRef.current.has(subscriptionProductId)
          ) {
            return false;
          }
          // Empty string fallback keeps the type field present even if the
          // tagging element omitted it for some reason.
          const subscriptionProductType = target.getAttribute(SUBSCRIPTION_PRODUCT_TYPE_ATTR) ?? "";
          seenSubscriptionProductsRef.current.set(subscriptionProductId, subscriptionProductType);
          return true;
        },
      },
    ],
    [],
  );

  const onElementObserve = useCallback(
    (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      let hasNewImpressions = false;

      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const { target } = entry;
        for (const { attr, record } of trackingHandlers) {
          if (!target.hasAttribute(attr)) {
            continue;
          }
          if (record(target)) {
            hasNewImpressions = true;
          }
          observer.unobserve(target);
          break;
        }
      }

      if (hasNewImpressions) {
        debouncedUpdateImpressions();
      }
    },
    [debouncedUpdateImpressions, trackingHandlers],
  );

  useEffect(() => {
    // Scope to the page's React root so we cover both the body sections and
    // anything the Header renders (e.g., a tagged RobuxGift button), while
    // avoiding any unrelated `data-...` usage elsewhere in the app.
    const root = document.getElementById(ROOT_ELEMENT_ID);
    if (!root) {
      return;
    }

    const elements = [...root.querySelectorAll(TRACKING_SELECTOR)];
    if (elements.length === 0) {
      return;
    }

    const disconnect = observeChildrenVisibility(
      {
        elements,
        threshold: INTERSECTION_THRESHOLD,
      },
      onElementObserve,
    );

    return () => {
      disconnect();
      cancelUpdateImpressions();
    };
  }, [onElementObserve, cancelUpdateImpressions]);

  return impressionData;
}
