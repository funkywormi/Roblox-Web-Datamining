/**
 * Main hook for file upload with validation, preview, and state management
 */

import { useState, useCallback, useMemo } from 'react';
import { FileState, ValidationError, FileValidationOptions, PreviewOptions } from '../types';
import { useFileValidation } from './useFileValidation';
import { useFilePreview } from './useFilePreview';

export interface UseFileUploadOptions {
  validation?: FileValidationOptions;
  preview?: PreviewOptions;
  autoValidate?: boolean;
  autoPreview?: boolean;
  onFilesSelected?: (files: File[]) => void;
  onValidationComplete?: (errors: ValidationError[]) => void;
}

export interface UseFileUploadResult {
  state: FileState;
  selectFiles: (files: FileList | File[]) => void;
  validateFiles: () => ValidationError[];
  clearFiles: () => void;
  // removeFile: (fileId: string) => void;
  reset: () => void;
  hasFiles: boolean;
  isValid: boolean;
  previews: ReturnType<typeof useFilePreview>['previews'];
}

const initialState: FileState = {
  files: [],
  errors: []
};

/**
 * Comprehensive hook for file upload with validation, previews, and state management
 * @param options - Configuration options
 * @returns Upload utilities and state
 */
export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadResult => {
  const {
    validation = {},
    preview = {},
    autoValidate = true,
    autoPreview = true,
    onFilesSelected,
    onValidationComplete
  } = options;

  const [fileState, setFileState] = useState<FileState>(initialState);

  const { validate, isValid: checkIsValid } = useFileValidation(validation);
  const { previews, generatePreviews, clearPreviews } = useFilePreview(preview);

  const selectFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = files instanceof FileList ? Array.from(files) : files;

      // Update state with new files
      setFileState(prev => ({
        ...prev,
        files: fileArray,
        errors: []
      }));

      // Call onFilesSelected callback
      if (onFilesSelected) {
        onFilesSelected(fileArray);
      }

      // Auto-validate if enabled
      if (autoValidate) {
        const errors = validate(fileArray);
        setFileState(prev => ({
          ...prev,
          errors
        }));

        if (onValidationComplete) {
          onValidationComplete(errors);
        }
      }

      // Auto-generate previews if enabled
      if (autoPreview) {
        generatePreviews(fileArray);
      }
    },
    [validate, autoValidate, autoPreview, onFilesSelected, onValidationComplete, generatePreviews]
  );

  const validateFiles = useCallback((): ValidationError[] => {
    const fileArray = fileState.files;
    const errors = validate(fileArray);

    setFileState(prev => ({
      ...prev,
      errors
    }));

    if (onValidationComplete) {
      onValidationComplete(errors);
    }

    return errors;
  }, [fileState.files, validate, onValidationComplete]);

  const clearFiles = useCallback(() => {
    setFileState(initialState);
    clearPreviews();
  }, [clearPreviews]);

  // One day we might want to remove individual files
  // const removeFile = useCallback(
  //   (fileId: string) => {
  //     setFileState(prev => ({
  //       ...prev,
  //       files: prev.files.filter(f => f.id !== fileId),
  //       errors: prev.errors.filter(e => {
  //         const file = prev.files.find(f => f.id === fileId)?.file;
  //         return e.file !== file;
  //       })
  //     }));
  //     removePreview(fileId);
  //   },
  //   [removePreview]
  // );

  const reset = useCallback(() => {
    clearFiles();
    setFileState(initialState);
  }, [clearFiles]);

  const hasFiles = useMemo(() => fileState.files.length > 0, [fileState.files.length]);

  const isValid = useMemo(() => {
    if (fileState.files.length === 0) return false;
    return checkIsValid(fileState.files);
  }, [fileState.files, checkIsValid]);

  return {
    state: fileState,
    selectFiles,
    validateFiles,
    clearFiles,
    // removeFile,
    reset,
    hasFiles,
    isValid,
    previews
  };
};
