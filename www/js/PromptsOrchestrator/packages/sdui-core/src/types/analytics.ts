// ─── Analytics Types ───

export type AnalyticsFieldMap = Record<string, string | number | boolean>;

export interface AnalyticsContext {
  analyticsData?: AnalyticsFieldMap;
  ancestorAnalyticsData?: AnalyticsFieldMap;
  getCollectionData?: () => CollectionAnalyticsData | undefined;
  /** Set by collection components so descendants resolve collection data via `getCollectionData`. */
  setCollectionData?: (data: CollectionAnalyticsData) => void;
  setLocalAnalyticsData?: (fields: AnalyticsFieldMap) => void;
  getAnalyticsDataSnapshot: () => AnalyticsFieldMap;
  getAncestorAnalyticsDataSnapshot: () => AnalyticsFieldMap;
}

export interface CollectionAnalyticsData extends AnalyticsFieldMap {
  collectionId: number;
  contentType: string;
  itemsPerRow: number;
  collectionPosition: number;
  totalNumberOfItems: number;
  collectionComponentType: string;
}

export interface ItemAnalyticsData extends AnalyticsFieldMap {
  id: string;
  itemPosition: number;
  itemComponentType: string;
}

export interface SduiPageContext {
  pageName: string;
  appPage: string;
}

export const FALLBACK_PAGE_CONTEXT: SduiPageContext = {
  pageName: "unknown",
  appPage: "unknown",
};

export interface SduiEventDescriptor {
  name: string;
  type: string;
  context: string;
}

export interface SduiAnalyticsReporter {
  reportOmniFeedStats(
    feedStats: Record<string, string | number>,
    pageContext?: SduiPageContext,
  ): void;

  /**
   * Generic sink for telemetry events for events. Descriptor + fields pass straight through to the underlying
   * transport (`sendEvent` on CSR).
   */
  logEvent(descriptor: SduiEventDescriptor, fields: Record<string, string | number>): void;
}
