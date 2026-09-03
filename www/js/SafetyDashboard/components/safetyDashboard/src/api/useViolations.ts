import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { VIOLATIONS_QUERY_KEY } from "./queryKeys";
import { sendUnknownViolationEvent } from "../telemetry/appealsEvents";
import {
  EnrichedViolation,
  enrichViolation,
  fetchAtLeastXViolations,
  filterOutInvalidEvidence,
  isSupportedViolation,
} from "../features/violations/util/violations";

const PAGE_SIZE = 10;

/**
 * Fetches the current user's moderation violations with paginated infinite
 * scrolling. Each page is filtered to supported violation types (unsupported
 * ones are logged and reported via telemetry), stripped of invalid evidence,
 * and enriched with localized, display-ready data. Returns the underlying
 * infinite query alongside a flattened `violations` array spanning all pages.
 */
export const useViolations = () => {
  const translationResource = useTranslation();

  const query = useInfiniteQuery({
    queryKey: [VIOLATIONS_QUERY_KEY],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const resp = await fetchAtLeastXViolations({
        count: PAGE_SIZE,
        page_token: pageParam,
      });

      const violations: EnrichedViolation[] = [];

      resp.violations.forEach(violation => {
        if (isSupportedViolation(violation)) {
          const violationCopy = filterOutInvalidEvidence(violation);
          violations.push(enrichViolation(violationCopy, translationResource));
        } else {
          console.warn(`Unsupported violation:`, violation);
          sendUnknownViolationEvent({ violation });
        }
      });

      return { violations, nextPageToken: resp.next_page_token };
    },
    getNextPageParam: lastPage => lastPage.nextPageToken,
  });

  const violations: EnrichedViolation[] = useMemo(
    () =>
      query.data?.pages.reduce<EnrichedViolation[]>(
        (acc, page) => [...acc, ...page.violations],
        [],
      ) ?? [],
    [query.data?.pages],
  );

  return { ...query, violations };
};
