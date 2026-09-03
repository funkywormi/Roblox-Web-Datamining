import { createContext, useContext, useMemo } from "react";
import * as z from "zod/mini";
import { URL_PARAMS } from "../utils/constants";
import sendAnalyticsEvent, { TelemetryEventType } from "../utils/sendAnalyticsEvent";

const UrlCustomParamsSchema = z.optional(
  z.object({
    stringId: z.optional(z.string()),
    conversationId: z.optional(z.string()),
    forumPostId: z.optional(z.string()),
    assetType: z.optional(z.string()), // This is for the item asset type in the report
    assetTypeId: z.optional(z.string()), // This is for the item asset type id in the report where name doesn't work
    adCreativeAssetId: z.optional(z.string()),
  }),
);
export type CustomUrlParamsType = z.infer<typeof UrlCustomParamsSchema>;

export type UrlParamsType = {
  abuseVector: string;
  targetId: string;
  submitterId?: string;
  customParams?: CustomUrlParamsType;
  dialogModeEnabled: boolean;
};

export const UrlParamContext = createContext<UrlParamsType | undefined>(undefined);

export const useSearchParams = () => {
  const context = useContext(UrlParamContext);
  if (!context) {
    throw new Error("useUrlParams must be used within a UrlParamProvider");
  }
  return context;
};

type UrlParamProviderProps = {
  children: React.JSX.Element;
};

export const ArwpUrlParamProvider = ({ children }: UrlParamProviderProps) => {
  const params = useMemo(() => {
    const { searchParams } = new URL(window.location.href);
    const abuseVector = searchParams.get(URL_PARAMS.ABUSE_VECTOR);
    if (abuseVector == null) {
      throw new Error("Invalid custom params");
    }
    const targetId = searchParams.get(URL_PARAMS.TARGET_ID);
    if (targetId == null) {
      throw new Error("Invalid custom params");
    }
    const submitterId = searchParams.get(URL_PARAMS.SUBMITTER_ID) ?? undefined;
    const dialogModeEnabled = searchParams.get(URL_PARAMS.DIALOG) === "true";
    const custom = searchParams.get(URL_PARAMS.CUSTOM);
    let customParams: CustomUrlParamsType | undefined;
    if (custom) {
      const { success, data, error } = UrlCustomParamsSchema.safeParse(JSON.parse(custom));
      if (success) {
        customParams = data;
      } else {
        sendAnalyticsEvent({
          abuseVector,
          eventType: TelemetryEventType.Error,
          meta: {
            error: `ArwpUrlParamProvider - UrlCustomParamsSchema: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
          },
        });
      }
    }
    return {
      abuseVector,
      targetId,
      submitterId,
      customParams,
      dialogModeEnabled,
    } satisfies UrlParamsType;
  }, []);

  return <UrlParamContext.Provider value={params}>{children}</UrlParamContext.Provider>;
};
