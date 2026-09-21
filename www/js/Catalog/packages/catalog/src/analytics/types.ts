export enum AXSendTrackingActionType {
  View = 0,
  Click = 1,
  Error = 2,
}

export enum AXSendTrackingPlatformType {
  Web = 0,
  MobileWeb = 1,
}

export interface AXSendTrackingContextType {
  itemName: string;
  actionType?: AXSendTrackingActionType;
  metaData?: Partial<Record<AXAnalyticsOptionalColumnNames, string | number>>;
  excludeCounter?: boolean;
  excludeTelemetry?: boolean;
  counterName?: string;
}

export interface AXErrorContextType {
  itemName: string;
  log: string;
  counterName: string;
}

export interface AXAnalyticsConstantsType {
  [key: string]: string;
}

// Please keep this in sync with economy_web_actions.proto
export enum AXAnalyticsOptionalColumnNames {
  totalValue = "totalValue",
  metaData = "metaData",
}
