import { EventStreamMetadata } from "../constants/eventStreamConstants";

/** URL referral params expect appliedFilters pre-encoded before `getUrlWithQueries`. */
export function getAppliedFiltersMetadataForUrlReferral(
  appliedFilters: unknown,
): { [EventStreamMetadata.AppliedFilters]: string } | Record<string, never> {
  if (typeof appliedFilters !== "string" || appliedFilters === "") {
    return {};
  }

  return {
    [EventStreamMetadata.AppliedFilters]: encodeURIComponent(appliedFilters),
  };
}
