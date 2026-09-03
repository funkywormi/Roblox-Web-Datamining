import { useMutation } from '@tanstack/react-query';
import type { CreateFormRequest, CustomForm } from '@rbx/custom-forms';

import customFormsService from '../services/customFormsService';

type UseCreatePollOptions = {
  groupId: number;
  vertical: string;
  onSuccess?: (form: CustomForm) => void;
  onError?: (error: unknown) => void;
};

export default function useCreatePoll({
  groupId,
  vertical,
  onSuccess,
  onError
}: UseCreatePollOptions) {
  return useMutation({
    mutationFn: (request: CreateFormRequest) =>
      customFormsService.createForm(groupId, vertical, request),
    onSuccess,
    onError
  });
}
