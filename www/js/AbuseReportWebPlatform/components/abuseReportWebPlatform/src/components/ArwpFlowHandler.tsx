import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { useTranslation } from "@rbx/core-scripts/react";
import ArwpSingleStepContainer from "./ArwpSingleStepContainer";
import {
  AbuseReportBeduiContextStatus,
  useAbuseReportBeduiContext,
  useBeduiNodeByStepId,
} from "../context/ArwpBeduiProvider";
import { useAbuseReportFormData } from "../context/ArwpFormDataProvider";
import getReportBody from "../utils/getReportBody";
import submitReport from "../utils/submitReport";
import { AbuseReportLegacyPayloadModel } from "../utils/types";
import ArwpSingleStepContentRenderer from "./ArwpSingleStepContentRenderer";
import sendAnalyticsEvent, { TelemetryEventType } from "../utils/sendAnalyticsEvent";
import { useSearchParams } from "../context/ArwpUrlParamProvider";
import { ArwpError } from "./ArwpError";

const MAX_RETRIES = 3;
const isObject = (error: unknown): error is Record<string, unknown> =>
  error != null && typeof error === "object";

const ArwpFlowHandler = () => {
  const [stepIdStack, setStepIdStack] = useState<number[]>([]);
  const [curStepId, setCurStepId] = useState<number>(0);
  const [nextStepId, setNextStepId] = useState<number>(0);
  const [hasSubmissionError, setHasSubmissionError] = useState<boolean>(false);
  const { translate } = useTranslation();
  const beduiData = useAbuseReportBeduiContext();
  const curBeduiNode = useBeduiNodeByStepId(curStepId);
  const { formData, setFormData, additionalReportTags } = useAbuseReportFormData();
  const { abuseVector, targetId, submitterId, customParams } = useSearchParams();

  // Submit report queries
  const reportPayload = useMemo(
    (): AbuseReportLegacyPayloadModel => ({
      Comment: String(formData.get("free_comment") ?? ""),
      Id: String(formData.get("target_id") ?? 0),
      StringId: String(formData.get("string_id") ?? ""),
      ReportCategory: String(
        formData.get("legacy_abuse_category") ?? formData.get("abuse_category") ?? 0,
      ),
      RedirectUrl: environmentUrls.websiteUrl,
      ConversationId: String(formData.get("conversation_id") ?? ""),
      ForumPostId: String(formData.get("forum_post_id") ?? ""),
      AssetType: String(formData.get("asset_type") ?? ""),
      AssetTypeId: String(formData.get("asset_type_id") ?? ""),
    }),
    [formData],
  );
  const reportBody = useMemo(
    () => getReportBody(abuseVector, reportPayload, additionalReportTags),
    [abuseVector, reportPayload, additionalReportTags],
  );
  // This is the query for the main report which targets the user's selected abuse vector
  const reportMutation = useMutation({
    mutationKey: ["submitReport", reportBody],
    mutationFn: async () => {
      await submitReport({
        abuseVector,
        payload: reportPayload,
        reportBody,
      });
    },
    onError: error => {
      sendAnalyticsEvent({
        abuseVector,
        eventType: TelemetryEventType.Error,
        meta: {
          error: `ArwpFlowHandler - submitReport: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
        },
      });
      setHasSubmissionError(true);
    },
    onSuccess: () => {
      sendAnalyticsEvent({
        abuseVector,
        eventType: TelemetryEventType.Submitted,
      });
    },
    onSettled: () => {
      setStepIdStack(prevStack => [...prevStack, curStepId]);
      setCurStepId(nextStepId);
    },
    retry: (failureCount: number, error: unknown) =>
      failureCount < MAX_RETRIES && !(isObject(error) && error.status === 429),
  });

  // Initialize form data from URL search params
  useEffect(() => {
    const newFormDataMap = new Map();
    newFormDataMap.set("target_id", targetId);
    newFormDataMap.set("submitter_id", submitterId);
    newFormDataMap.set("abuse_vector", abuseVector);

    // Parse custom params from the URL
    if (customParams) {
      try {
        newFormDataMap.set("string_id", customParams.stringId ?? "");
        newFormDataMap.set("conversation_id", customParams.conversationId ?? "");
        newFormDataMap.set("forum_post_id", customParams.forumPostId ?? "");
        newFormDataMap.set("asset_type", customParams.assetType ?? "");
        newFormDataMap.set("asset_type_id", customParams.assetTypeId ?? "");
      } catch {
        newFormDataMap.set("string_id", "");
        newFormDataMap.set("conversation_id", "");
        newFormDataMap.set("forum_post_id", "");
        newFormDataMap.set("asset_type", "");
        newFormDataMap.set("asset_type_id", "");
      }
    }
    setFormData(newFormDataMap);
  }, [abuseVector, customParams, submitterId, targetId, setFormData]);

  // Set the current step ID when the bedui data is successfully loaded
  useEffect(() => {
    if (beduiData.status === AbuseReportBeduiContextStatus.SUCCESS && beduiData.beduiData) {
      setCurStepId(beduiData.beduiData.rootStepId);
    }
  }, [beduiData]);

  // Handle the transition to the next step in the report flow
  const onNextStep = useCallback(
    (nextStepId: number) => {
      setNextStepId(nextStepId);
      if (curBeduiNode?.actionInfo.shouldSubmit) {
        // Submit the main report and any separate reports for the current step
        reportMutation.mutate();
      }
    },
    [curBeduiNode?.actionInfo.shouldSubmit, reportMutation],
  );

  const onPrevStep = useCallback(() => {
    const prevStepId = stepIdStack.pop();
    if (prevStepId != null) {
      setCurStepId(prevStepId);
    }
  }, [stepIdStack]);

  return (
    <div className="abuse-report-flow-handler">
      {beduiData.status === AbuseReportBeduiContextStatus.SUCCESS && !hasSubmissionError && (
        <React.Fragment>
          <ArwpSingleStepContainer
            curBeduiNode={curBeduiNode}
            stepIdStack={stepIdStack}
            onNextStep={onNextStep}
            onPrevStep={onPrevStep}
          />
          {curBeduiNode?.footerContentConfig && (
            <ArwpSingleStepContentRenderer
              contentConfig={curBeduiNode.footerContentConfig}
              formDataKeysWithError={[]}
            />
          )}
        </React.Fragment>
      )}
      {beduiData.status === AbuseReportBeduiContextStatus.ERROR && !hasSubmissionError && (
        <ArwpError text={translate("Message.NoResultsFound")} />
      )}
      {hasSubmissionError && <ArwpError text={translate("Message.SubmissionError")} />}
    </div>
  );
};

export default ArwpFlowHandler;
