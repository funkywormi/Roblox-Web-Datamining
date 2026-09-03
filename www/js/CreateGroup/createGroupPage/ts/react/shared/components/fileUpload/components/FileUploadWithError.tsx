import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import FileUpload from '../FileUpload';
import { FileValidationOptions, ValidationError, ValidationErrorType } from '../types';
import { fileTypes } from '../constants/fileTypes';

export type FileUploadWithErrorProps = {
  fileUploadKey?: number;
  onChange: (files: FileList) => void;
  blockOnValidationError: boolean;
  errorMessage?: string | null;
  maxFileSizeInMb: number;
  translationKeys: {
    errors: {
      fileTooLarge: string;
      fileInvalid: string;
      fileUpdateFail: string;
    };
  };
  previewAssetId?: number;
  fileName?: string;
};

/**
 * A light wrapper around FileUpload that displays an error message when there is an error.
 * Works with both validation errors and custom error messages.
 */
const FileUploadWithError: React.FC<FileUploadWithErrorProps> = ({
  fileUploadKey,
  onChange,
  blockOnValidationError,
  errorMessage,
  maxFileSizeInMb,
  translationKeys,
  previewAssetId,
  fileName
}) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const [error, setError] = useState<string | undefined | null>(errorMessage);

  useEffect(() => {
    setError(errorMessage);
  }, [errorMessage, fileUploadKey]);

  const handleChange = useCallback(
    (files: FileList) => {
      setError(null);
      onChange(files);
    },
    [onChange]
  );

  const handleValidationError = useCallback(
    (errorsList: ValidationError[]) => {
      let message = '';
      if (errorsList[0]?.type === ValidationErrorType.FILE_SIZE) {
        message = translationKeys.errors.fileTooLarge
          ? translate(translationKeys.errors.fileTooLarge, {
              maxSize: maxFileSizeInMb
            })
          : '';
      } else if (errorsList[0]?.type === ValidationErrorType.FILE_TYPE) {
        message = translate(translationKeys.errors.fileInvalid);
      } else {
        message = translate(translationKeys.errors.fileUpdateFail);
      }
      systemFeedbackService.warning(message);
      setError(message);
    },
    [systemFeedbackService, translationKeys, translate, maxFileSizeInMb]
  );

  const fileValidation: FileValidationOptions = useMemo(
    () => ({
      accept: fileTypes.image,
      maxFileSize: maxFileSizeInMb * 1024 * 1024,
      maxFiles: 1
    }),
    [maxFileSizeInMb]
  );

  return (
    <div className='file-upload-container full-screen'>
      <div className='flex'>
        <FileUpload
          key={fileUploadKey}
          onChange={handleChange}
          validation={fileValidation}
          onValidationError={handleValidationError}
          blockOnValidationError={blockOnValidationError}
          previewAssetId={previewAssetId}
          fileName={fileName}
        />
      </div>
      <div className='flex' style={{ minHeight: '14px' }}>
        <span className='content-action-alert text-caption-small'>{error}</span>
      </div>
    </div>
  );
};

export default FileUploadWithError;
