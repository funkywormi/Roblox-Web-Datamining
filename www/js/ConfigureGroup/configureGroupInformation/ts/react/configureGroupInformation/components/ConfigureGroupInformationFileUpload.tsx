import React, { useState, useCallback } from 'react';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import groupsConstants from '../../shared/constants/groupConstants';
import SectionContainerHeader from '../../shared/components/SectionContainerHeader';
import { ServiceErrorResponse } from '../../shared/types';
import FileUploadWithError from '../../shared/components/fileUpload/components/FileUploadWithError';

export type ConfigureGroupInformationFileUploadTranslationKeys = {
  text: {
    sectionTitle: string;
    description?: string;
    saveButton: string;
    deleteButton?: string;
  };
  success: {
    fileUpdateSuccess: string;
    fileDeleteSuccess?: string;
  };
  errors: {
    fileMissing: string;
    fileInvalid: string;
    fileTooLarge: string;
    fileUpdateFail: string;
    fileDeleteFail?: string;
    tooManyRequests: string;
    unknown: string;
  };
};

export type ConfigureGroupInformationFileUploadProps = {
  groupId: number;
  includeDescription?: boolean;
  dimensions?: string;
  onSave: (groupId: number, file: File) => Promise<void>;
  onDelete?: (groupId: number) => Promise<void>;
  onUpdated: () => Promise<void>;
  maxFileSizeInMb: number;
  blockOnValidationError: boolean;
  currentAssetId?: number;
  translationKeys: ConfigureGroupInformationFileUploadTranslationKeys;
};

const ConfigureGroupInformationFileUpload: React.FC<ConfigureGroupInformationFileUploadProps> = ({
  groupId,
  includeDescription = true,
  dimensions,
  onSave,
  onDelete,
  onUpdated,
  maxFileSizeInMb,
  blockOnValidationError,
  currentAssetId,
  translationKeys
}) => {
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fileUploadKey, setFileUploadKey] = useState<number>(0);

  const handleFileChange = useCallback((files: FileList) => {
    setErrors(null);
    setFile(files && files.length > 0 ? files[0] : null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!file) {
      setErrors(translate(translationKeys.errors.fileMissing));
      systemFeedbackService.warning(translate(translationKeys.errors.fileUpdateFail));
      return;
    }

    setErrors(null);
    setIsSaving(true);
    try {
      await onSave(groupId, file);
      setFileUploadKey(f => f + 1); // Force rerender to clear file upload state
      systemFeedbackService.success(translate(translationKeys.success.fileUpdateSuccess));
      setFile(null); // Clear the file state to disable save button
      await onUpdated(); // Trigger parent to refetch configuration for new previewAssetId
    } catch (error: unknown) {
      systemFeedbackService.warning(translate(translationKeys.errors.fileUpdateFail));
      const typedError = error as ServiceErrorResponse;
      switch (typedError.data?.errors?.[0]?.code) {
        case groupsConstants.errorCodes.internal.groupCoverPhotoMissing:
          setErrors(translate(translationKeys.errors.fileMissing));
          break;
        case groupsConstants.errorCodes.internal.groupCoverPhotoInvalid:
          setErrors(translate(translationKeys.errors.fileInvalid));
          break;
        case groupsConstants.errorCodes.internal.tooManyRequests:
          setErrors(translate(translationKeys.errors.tooManyRequests));
          break;
        default:
          setErrors(translate(translationKeys.errors.fileUpdateFail));
          break;
      }
    } finally {
      setIsSaving(false);
    }
  }, [translate, translationKeys, groupId, onSave, onUpdated, systemFeedbackService, file]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) {
      return;
    }

    setErrors(null);
    setIsDeleting(true);
    try {
      await onDelete(groupId);
      setFileUploadKey(f => f + 1); // Force rerender to clear file upload state
      systemFeedbackService.success(
        translationKeys.success.fileDeleteSuccess
          ? translate(translationKeys.success.fileDeleteSuccess)
          : ''
      );
      setFile(null); // Clear file state to disable delete button
      await onUpdated(); // Trigger parent to refetch configuration
    } catch (error: unknown) {
      systemFeedbackService.warning(
        translationKeys.errors.fileDeleteFail
          ? translate(translationKeys.errors.fileDeleteFail)
          : ''
      );
    } finally {
      setIsDeleting(false);
    }
  }, [translate, translationKeys, groupId, onDelete, onUpdated, systemFeedbackService]);

  return (
    <div data-testid='configure-group-information-file-upload-section'>
      <SectionContainerHeader title={translate(translationKeys.text.sectionTitle)} />
      {includeDescription && (
        <div className='text-description'>
          {translationKeys.text.description
            ? translate(translationKeys.text.description, {
                dimensions: dimensions?.split(',').join(', ')
              })
            : ''}
        </div>
      )}
      <FileUploadWithError
        fileUploadKey={fileUploadKey}
        onChange={handleFileChange}
        blockOnValidationError={blockOnValidationError}
        errorMessage={errors}
        maxFileSizeInMb={maxFileSizeInMb}
        translationKeys={translationKeys}
        previewAssetId={currentAssetId}
        fileName={translate(translationKeys.text.sectionTitle)}
      />
      <div className='text-align-x-right'>
        <Button
          className='inline-flex'
          variant='Standard'
          size='Medium'
          isDisabled={file === null || isDeleting}
          isLoading={isSaving}
          onClick={handleSave}>
          {translate(translationKeys.text.saveButton)}
        </Button>
        {onDelete && (
          <Button
            style={{ marginLeft: '8px' }}
            className='inline-flex'
            variant='Alert'
            size='Medium'
            onClick={handleDelete}
            isDisabled={!currentAssetId || isSaving}
            isLoading={isDeleting}>
            {translationKeys.text.deleteButton ? translate(translationKeys.text.deleteButton) : ''}
          </Button>
        )}
      </div>
      <SystemFeedbackComponent />
    </div>
  );
};

export default ConfigureGroupInformationFileUpload;
