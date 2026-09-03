import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Intl from "@rbx/core-scripts/intl";
import {
  BeduiMappedNodesDataSchema,
  BeduiMappedNodesDataType,
  BeduiNodeType,
  BeduiResponseDataSchema,
} from "../utils/types";
import fetchBeduiData from "../utils/fetchBeduiData";
import validateBeduiData from "../utils/validateBeduiData";
import sendAnalyticsEvent, { TelemetryEventType } from "../utils/sendAnalyticsEvent";
import { useSearchParams } from "./ArwpUrlParamProvider";

export enum AbuseReportBeduiContextStatus {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

type AbuseReportBeduiContextState =
  | {
      status: AbuseReportBeduiContextStatus.LOADING;
    }
  | {
      status: AbuseReportBeduiContextStatus.SUCCESS;
      beduiData: BeduiMappedNodesDataType | null;
    }
  | {
      status: AbuseReportBeduiContextStatus.ERROR;
      error: unknown;
    };

export const AbuseReportBeduiContext = createContext<AbuseReportBeduiContextState>({
  status: AbuseReportBeduiContextStatus.ERROR,
  error: new Error("No context"),
});

export const useAbuseReportBeduiContext = (): AbuseReportBeduiContextState =>
  useContext(AbuseReportBeduiContext);

export const useBeduiNodeByStepId = (stepId: number): BeduiNodeType | null => {
  const [node, setNode] = useState<BeduiNodeType | null>(null);
  const beduiContext = useContext(AbuseReportBeduiContext);
  useEffect(() => {
    if (beduiContext.status === AbuseReportBeduiContextStatus.SUCCESS && beduiContext.beduiData) {
      const BeduiNode = beduiContext.beduiData.stepIdToNodeMap.get(stepId) ?? null;
      setNode(BeduiNode);
    }
  }, [beduiContext, stepId]);
  return node;
};

type Props = {
  children: ReactNode;
};

export const ArwpBeduiProvider = ({ children }: Props) => {
  const [beduiData, setBeduiData] = useState<AbuseReportBeduiContextState>({
    status: AbuseReportBeduiContextStatus.LOADING,
  });
  const { targetId, submitterId, abuseVector, customParams } = useSearchParams();
  const locale = new Intl().getLocale();

  useEffect(() => {
    fetchBeduiData(targetId, abuseVector, JSON.stringify(customParams), locale).then(
      result => {
        // Runtime shape check
        const parsedResult = validateBeduiData(BeduiResponseDataSchema, result);
        if (!parsedResult.success || !parsedResult.data) {
          setBeduiData({
            status: AbuseReportBeduiContextStatus.ERROR,
            error: parsedResult.error,
          });
          sendAnalyticsEvent({
            abuseVector,
            eventType: TelemetryEventType.Error,
            meta: {
              error: `ArwpBeduiProvider - Bedui shape validation: ${parsedResult.error?.message}`,
            },
          });
          return;
        }

        const stepIdToNodeMap = new Map<number, BeduiNodeType>();
        const data: BeduiMappedNodesDataType = {
          rootStepId: parsedResult.data.rootStepId,
          stepIdToNodeMap: parsedResult.data.nodes.reduce((acc, node) => {
            acc.set(node.stepId, node);
            return acc;
          }, stepIdToNodeMap),
        };
        // Runtime shape check to make sure the mapping is correct
        const parsedData = validateBeduiData(BeduiMappedNodesDataSchema, data);
        if (!parsedData.success || !parsedData.data) {
          setBeduiData({
            status: AbuseReportBeduiContextStatus.ERROR,
            error: parsedData.error,
          });
          sendAnalyticsEvent({
            abuseVector,
            eventType: TelemetryEventType.Error,
            meta: {
              error: `ArwpBeduiProvider - Bedui mapped node shape validation: ${parsedData.error?.message}`,
            },
          });
          return;
        }

        setBeduiData({
          status: AbuseReportBeduiContextStatus.SUCCESS,
          beduiData: parsedData.data,
        });
      },
      (error: unknown) => {
        setBeduiData({
          status: AbuseReportBeduiContextStatus.ERROR,
          error,
        });
      },
    );
  }, [targetId, submitterId, abuseVector, locale, customParams]);

  return (
    <AbuseReportBeduiContext.Provider value={beduiData}>
      {children}
    </AbuseReportBeduiContext.Provider>
  );
};
