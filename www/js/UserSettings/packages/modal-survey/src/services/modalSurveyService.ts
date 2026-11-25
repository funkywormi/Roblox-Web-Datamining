import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";

import {
  getModalSurveyResponseSchema,
  ModalQuestionType,
  submitModalSurveyResponseSchema,
} from "../types";
import type {
  ModalQuestion,
  ModalSurvey,
  SubmitModalSurveyRequest,
  SubmitModalSurveyResponse,
} from "../types";

const getApiGatewayUrl = (path: string): Url =>
  Url.parse(environmentUrls.apiGatewayUrl).getOrThrow().withPath(path);

const hasChoicesIfMultipleChoice = (question: ModalQuestion): boolean =>
  question.type !== ModalQuestionType.MultipleChoiceSingle || Boolean(question.choices?.length);

/**
 * Asks SurvBlox whether to prompt the user for the modal survey attached to `eventType`.
 * Skips multiple choice questions without choices. Resolves to the survey when the user is
 * eligible and it has questions left, otherwise null.
 */
export const fetchModalSurvey = async (eventType: string): Promise<ModalSurvey | null> => {
  const url = getApiGatewayUrl("/v1/survey").withSearchParamsAppended({
    eventType,
    surveyType: "inline",
  });
  const result = await http.get(url, getModalSurveyResponseSchema, { credentials: "include" });
  const { shouldPromptSurvey, surveyId, questions } = result.getOrThrow();
  const shownQuestions = questions?.filter(hasChoicesIfMultipleChoice) ?? [];
  if (!shouldPromptSurvey || !surveyId || !shownQuestions.length) {
    return null;
  }
  return { surveyId, questions: shownQuestions };
};

/** Records every answer for the survey in one call. Resubmitting with the same idempotency key is safe. */
export const submitModalSurveyResponse = async (
  request: SubmitModalSurveyRequest,
): Promise<SubmitModalSurveyResponse> => {
  const result = await http.post(
    getApiGatewayUrl("/v1/survey/response"),
    request,
    submitModalSurveyResponseSchema,
    { credentials: "include" },
  );
  return result.getOrThrow();
};

/**
 * Allows an ModalSurvey caller to manually initiate a cooldown. The API rejects the request if the
 * provided surveyId does not support manual cooldowns.
 */
export const recordModalSurveyExposure = async (surveyId: string): Promise<void> => {
  const result = await http.postUntyped(
    getApiGatewayUrl(`/v1/surveys/${surveyId}/exposure`),
    {},
    { credentials: "include" },
  );
  result.getOrThrow();
};
