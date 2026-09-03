import { httpService } from 'core-utilities';
import type {
  CreateFormRequest,
  CustomForm,
  ResponseSpecs,
  AggregatedResults,
  FormResponse,
  ResponseValue
} from '@rbx/custom-forms';

import customFormsConstants from '../constants/customFormsConstants';
import {
  AggregatedFieldType,
  FormResultsModel,
  FormResultsResponse,
  ResponseValueResponse
} from '../types';

const mapResults = (raw?: FormResultsResponse['results']): AggregatedResults | undefined => {
  if (!raw) return undefined;
  return {
    totalResponses: raw.totalResponses,
    fieldResults: raw.fieldResults.map(fr => ({
      fieldId: fr.fieldId,
      label: fr.label,
      fieldType: fr.fieldType as AggregatedFieldType,
      optionResults: { optionResults: fr.optionResults }
    }))
  };
};

const mapUserResponse = (raw?: FormResultsResponse['userResponse']): FormResponse | undefined => {
  if (!raw?.values) return undefined;
  const mapped: Record<string, ResponseValue> = {};
  for (const [fieldId, val] of Object.entries(raw.values)) {
    if (val.multiChoiceOptionIds) {
      mapped[fieldId] = { multiValue: { optionIds: val.multiChoiceOptionIds } };
    } else if (val.choiceOptionId) {
      mapped[fieldId] = { choiceValue: { optionId: val.choiceOptionId } };
    }
  }
  return {
    formId: raw.formId,
    userId: raw.userId,
    createdTime: raw.createdTime,
    responseSpecs: { values: mapped }
  };
};

const mapResponseSpecsToApi = (
  specs: ResponseSpecs
): { values: Record<string, ResponseValueResponse> } => {
  const mapped: Record<string, ResponseValueResponse> = {};
  for (const [fieldId, val] of Object.entries(specs.values)) {
    if ('choiceValue' in val) {
      mapped[fieldId] = { choiceOptionId: val.choiceValue.optionId };
    } else if ('multiValue' in val) {
      mapped[fieldId] = { multiChoiceOptionIds: val.multiValue.optionIds };
    } else {
      // eslint-disable-next-line no-console
      console.warn('mapResponseSpecsToApi: dropping unknown response value', { fieldId, val });
    }
  }
  return { values: mapped };
};

const createForm = async (
  groupId: number,
  vertical: string,
  request: CreateFormRequest
): Promise<CustomForm> => {
  const urlConfig = {
    url: customFormsConstants.urls.getCreateFormUrl(groupId),
    withCredentials: true
  };

  const body = {
    title: request.title,
    description: request.description,
    formType: request.formType,
    formSpecs: request.formSpecs,
    cfVertical: vertical
  };

  const { data } = await httpService.post(urlConfig, body);
  return data as CustomForm;
};

const getFormResults = async (
  groupId: number,
  vertical: string,
  formId: number
): Promise<FormResultsModel> => {
  const urlConfig = {
    url: customFormsConstants.urls.getFormResultsUrl(groupId, formId),
    retryable: true,
    withCredentials: true
  };

  const { data } = await httpService.get<FormResultsResponse>(urlConfig, {
    cfVertical: vertical
  });

  return {
    form: data.form,
    results: mapResults(data.results),
    response: mapUserResponse(data.userResponse)
  };
};

const submitFormResponse = async (
  groupId: number,
  vertical: string,
  formId: number,
  responseSpecs: ResponseSpecs
): Promise<void> => {
  const urlConfig = {
    url: customFormsConstants.urls.getSubmitFormResponseUrl(groupId, formId),
    withCredentials: true
  };

  await httpService.post(urlConfig, {
    responseSpecs: mapResponseSpecsToApi(responseSpecs),
    cfVertical: vertical
  });
};

export default {
  createForm,
  getFormResults,
  submitFormResponse
};
