import { useCallback, useMemo } from 'react';
import { ValidationError, FileValidationOptions } from '../types';
import { validateFiles, validateFile, areFilesValid } from '../utils/validation';

export interface UseFileValidationResult {
  validate: (files: FileList | File[]) => ValidationError[];
  validateSingle: (file: File) => ValidationError[];
  isValid: (files: FileList | File[]) => boolean;
  options: FileValidationOptions;
}

/**
 * Hook to handle file validation with customizable rules
 * @param options - Validation options
 * @returns Validation utilities
 */
export const useFileValidation = (options: FileValidationOptions = {}): UseFileValidationResult => {
  const validate = useCallback(
    (files: FileList | File[]): ValidationError[] => {
      return validateFiles(files, options);
    },
    [options]
  );

  const validateSingle = useCallback(
    (file: File): ValidationError[] => {
      return validateFile(file, options);
    },
    [options]
  );

  const isValid = useCallback(
    (files: FileList | File[]): boolean => {
      return areFilesValid(files, options);
    },
    [options]
  );

  return useMemo(
    () => ({
      validate,
      validateSingle,
      isValid,
      options
    }),
    [validate, validateSingle, isValid, options]
  );
};
