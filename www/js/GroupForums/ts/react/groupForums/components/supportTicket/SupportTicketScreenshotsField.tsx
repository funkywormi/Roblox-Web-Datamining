import React from 'react';
import { useTranslation } from 'react-utilities';
import {
  MAX_SCREENSHOTS,
  Screenshot,
  ScreenshotErrorMeta
} from '../../hooks/useSupportTicketScreenshots';
import SupportTicketField from './SupportTicketField';
import SupportTicketScreenshotPicker from './SupportTicketScreenshotPicker';
import SupportTicketScreenshotPreviewTile from './SupportTicketScreenshotPreviewTile';
import SupportTicketScreenshotUploadingTile from './SupportTicketScreenshotUploadingTile';

export type SupportTicketScreenshotsFieldProps = {
  screenshots: Screenshot[];
  uploadedCount: number;
  errorKey: string | null;
  errorMeta?: ScreenshotErrorMeta;
  remainingSlots: number;
  accept: string;
  onAddFiles: (files: FileList | File[]) => void;
  onRemove: (key: number) => void;
};

const SupportTicketScreenshotsField = ({
  screenshots,
  uploadedCount,
  errorKey,
  errorMeta,
  remainingSlots,
  accept,
  onAddFiles,
  onRemove
}: SupportTicketScreenshotsFieldProps): JSX.Element => {
  const { translate } = useTranslation();
  const removeLabel = translate('Action.Remove');
  const uploadingLabel = translate('Message.Uploading');
  const hint = translate('Label.SupportTicketScreenshotsHint');
  const isEmpty = screenshots.length === 0;
  const addControl =
    remainingSlots > 0 ? (
      <SupportTicketScreenshotPicker
        accept={accept}
        addLabel={translate('Action.Add')}
        isTile={!isEmpty}
        onAddFiles={onAddFiles}
      />
    ) : null;

  return (
    <SupportTicketField
      label={translate('Heading.SupportTicketScreenshots', {
        uploadedCount,
        maxCount: MAX_SCREENSHOTS
      })}
      labelTestId='support-ticket-screenshots-heading'>
      {isEmpty ? (
        <div className='flex items-center gap-large' data-testid='support-ticket-screenshots-empty'>
          {addControl}
          <span className='text-body-small content-default'>{hint}</span>
        </div>
      ) : (
        <React.Fragment>
          <div className='support-ticket-screenshots-tiles'>
            {screenshots.map((screenshot, index) =>
              screenshot.assetId === null || screenshot.isPreviewLoading === true ? (
                <SupportTicketScreenshotUploadingTile
                  key={screenshot.key}
                  index={index}
                  previewUrl={screenshot.previewUrl}
                  uploadingLabel={uploadingLabel}
                />
              ) : (
                <SupportTicketScreenshotPreviewTile
                  key={screenshot.key}
                  index={index}
                  previewUrl={screenshot.previewUrl}
                  removeLabel={removeLabel}
                  onRemove={() => onRemove(screenshot.key)}
                />
              )
            )}

            {addControl}
          </div>
          <span className='text-body-small content-default'>{hint}</span>
        </React.Fragment>
      )}

      {errorKey && (
        <span className='text-body-small text-error' data-testid='support-ticket-screenshots-error'>
          {translate(errorKey, errorMeta)}
        </span>
      )}
    </SupportTicketField>
  );
};

SupportTicketScreenshotsField.displayName = 'SupportTicketScreenshotsField';

export default SupportTicketScreenshotsField;
