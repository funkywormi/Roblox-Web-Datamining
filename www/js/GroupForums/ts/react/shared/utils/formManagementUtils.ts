import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

export interface BaseFormField<T> {
  id: string;
  initialValue: T;
}

export interface FormFieldState<T> extends BaseFormField<T> {
  currentValue: T;
  touched: boolean;
  identical: boolean;
  valid: boolean;
}

const DefaultFormState = Object.freeze({ touched: false, identical: true, valid: true });

export type FieldChanges<T> = { currentValue: T; valid: boolean };

export interface FormState<T> {
  id: string;
  fields: FormFieldState<T>[];
}

const findIndex = <T>(fields: FormFieldState<T>[], id: string): number =>
  fields.findIndex(f => f.id === id);

// field queries
export const isDirty = <T>(field: FormFieldState<T>): boolean => field.touched && !field.identical;

export const isInvalid = <T>(field: FormFieldState<T>): boolean => isDirty(field) && !field.valid;

export const isPristine = <T>(field: FormFieldState<T>): boolean =>
  !field.touched && field.identical;

export const isIdentical = <T>(field: FormFieldState<T>): boolean => field.identical;

export const isValidAndUnsaved = <T>(field: FormFieldState<T>): boolean =>
  !isInvalid(field) && !isIdentical(field);

// form queries
export const isFormDirty = <T>(form: FormState<T>): boolean => form.fields.some(isDirty);
export const isFormInvalid = <T>(form: FormState<T>): boolean => form.fields.some(isInvalid);
export const isFormPristine = <T>(form: FormState<T>): boolean => form.fields.every(isPristine);
export const isFormValidAndUnsaved = <T>(form: FormState<T>): boolean =>
  form.fields.every(isValidAndUnsaved);

// mutators
export const createForm = <T>(id: string, fields: BaseFormField<T>[]): FormState<T> => {
  const statefulFields: FormFieldState<T>[] = fields.map(f => ({
    ...f,
    initialValue: f.initialValue,
    currentValue: f.initialValue,
    ...DefaultFormState
  }));
  return {
    id,
    fields: statefulFields
  };
};

export const resetField = <T>(field: FormFieldState<T>): FormFieldState<T> => ({
  ...field,
  currentValue: field.initialValue,
  ...DefaultFormState
});

export const resetForm = <T>(form: FormState<T>): FormState<T> => {
  const clonedFields = cloneDeep(form.fields);
  return {
    id: form.id,
    fields: clonedFields.map(f => resetField(f))
  };
};

export const updateFormField = <T>(
  itemId: string,
  changes: { currentValue: T; valid: boolean },
  form: FormState<T>
): FormState<T> => {
  const index = findIndex(form.fields, itemId);
  if (index > -1) {
    const clonedFields = cloneDeep(form.fields);
    clonedFields[index] = {
      ...clonedFields[index],
      currentValue: changes.currentValue,
      valid: changes.valid,
      touched: true,
      identical: isEqual(changes.currentValue, clonedFields[index].initialValue)
    };
    return {
      id: form.id,
      fields: clonedFields
    };
  }

  return form;
};

export const resetFormField = <T>(itemId: string, form: FormState<T>): FormState<T> => {
  const index = findIndex(form.fields, itemId);
  if (index > -1) {
    const clonedFields = cloneDeep(form.fields);
    clonedFields[index] = resetField(clonedFields[index]);
    return {
      id: form.id,
      fields: clonedFields
    };
  }

  return form;
};
