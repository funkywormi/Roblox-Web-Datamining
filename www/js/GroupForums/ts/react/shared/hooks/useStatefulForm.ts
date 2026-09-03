import { useEffect, useState } from 'react';
import {
  BaseFormField,
  createForm,
  FieldChanges,
  FormState,
  isFormDirty,
  isFormInvalid,
  isFormPristine,
  isFormValidAndUnsaved,
  resetForm,
  resetFormField,
  updateFormField
} from '../utils/formManagementUtils';

export type FormStatus = {
  isPristine: boolean;
  isDirty: boolean;
  isInvalid: boolean;
  isValidAndUnsaved: boolean;
};

type StatefulForm<T> = FormStatus & {
  form: FormState<T>;
};

type StatefulFormApi<T> = {
  resetForm: () => void;
  updateFormItem: (itemId: string, changes: FieldChanges<T>) => void;
  formStatus: FormStatus;
};

const getNewFormStatus = (): FormStatus => ({
  isPristine: true,
  isDirty: false,
  isInvalid: false,
  isValidAndUnsaved: false
});

const refreshForm = <T>(form: FormState<T>): StatefulForm<T> => ({
  form,
  isPristine: isFormPristine(form),
  isDirty: isFormDirty(form),
  isInvalid: isFormInvalid(form),
  isValidAndUnsaved: isFormValidAndUnsaved(form)
});

// reducers, exported for unit testing
export const resetFormReducer = <T>() => (form: FormState<T>): FormState<T> => resetForm(form);

export const resetItemReducer = <T>(itemId: string) => (form: FormState<T>): FormState<T> =>
  resetFormField(itemId, form);

export const updateItemReducer = <T>(itemId: string, changes: FieldChanges<T>) => (
  form: FormState<T>
): FormState<T> => updateFormField(itemId, changes, form);

export const getStatus = <T>(state: StatefulForm<T>): FormStatus => {
  const { form, ...status } = state;
  return status;
};

const updateStatefulForm = <T>(
  state: StatefulForm<T> | undefined,
  callback: (formState: FormState<T>) => FormState<T>
): StatefulForm<T> | undefined => {
  if (!state) {
    return undefined;
  }
  const updatedForm = callback(state.form);
  return refreshForm(updatedForm);
};

const useStatefulForm = <T>(fields: BaseFormField<T>[]): StatefulFormApi<T> => {
  const [formState, setFormState] = useState<StatefulForm<T> | undefined>(undefined);
  useEffect(() => {
    if (formState === undefined) {
      const formInstance = createForm('statefulForm', fields);
      setFormState(refreshForm(formInstance));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    resetForm: () => setFormState(prev => updateStatefulForm(prev, resetFormReducer<T>())),
    updateFormItem: (itemId: string, changes: FieldChanges<T>) =>
      setFormState(prev => updateStatefulForm(prev, updateItemReducer<T>(itemId, changes))),
    formStatus: formState ? getStatus(formState) : getNewFormStatus()
  };
};

export default useStatefulForm;
