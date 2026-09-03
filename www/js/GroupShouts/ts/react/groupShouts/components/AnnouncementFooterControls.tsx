import React from 'react';
import { Button } from '@rbx/foundation-ui';
import classNames from 'classnames';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupAnnouncementsConfig } from '../translation.config';
import TextContentEditorError from '../../shared/components/content/TextContentEditorError';
import NativeFooter from '../../shared/components/NativeFooter';
import InlineProgressLoader from '../../shared/components/InlineProgressLoader';
import { useTextContentEditorContext } from '../../shared/components/content/TextContentEditorContext';

export type AnnouncementFooterControlsProps = {
  /**
   * Whether the Save button should be disabled. Computed by the parent so we can use a single
   * source of truth (current vs. saved baseline) instead of the editor's internal form state,
   * which is awkward to keep in sync after a baseline-commit save.
   */
  isSaveDisabled: boolean;
  /** Whether the save mutation is in flight; drives the button-internal loading spinner. */
  isSaveLoading: boolean;
  isPublishDisabled: boolean;
  onPublish: () => void;
  /**
   * When true, the Publish button is omitted entirely (not just disabled). Editing an already-
   * published announcement has no publish action — hiding rather than disabling avoids the
   * dead affordance.
   */
  isEditingPublished?: boolean;
} & WithTranslationsProps;

const AnnouncementFooterControls = ({
  isSaveDisabled,
  isSaveLoading,
  isPublishDisabled,
  onPublish,
  isEditingPublished = false,
  translate
}: AnnouncementFooterControlsProps): JSX.Element => {
  const {
    isLoading,
    onSubmitClicked,
    onBack,
    submitText,
    errorKey,
    showInlineProgress,
    inlineProgressText
  } = useTextContentEditorContext();

  return (
    <React.Fragment>
      <NativeFooter>
        {errorKey ? <TextContentEditorError message={translate(errorKey)} /> : null}
        {showInlineProgress && (
          <InlineProgressLoader
            variant='Indeterminate'
            size='Small'
            text={inlineProgressText}
            textClassNames={['text-body-medium']}
            ariaLabel={translate('Label.Loading')}
          />
        )}
        <div className='groups-native-footer-container'>
          {!isEditingPublished && (
            <Button
              as='button'
              size='Medium'
              variant='Emphasis'
              isDisabled={isPublishDisabled || isLoading}
              onClick={onPublish}>
              {translate('Action.Publish')}
            </Button>
          )}
          <Button
            as='button'
            size='Medium'
            variant='SoftEmphasis'
            isDisabled={isSaveDisabled || isSaveLoading}
            onClick={onSubmitClicked}>
            {submitText}
          </Button>
          <Button as='button' size='Medium' variant='Standard' onClick={onBack}>
            {translate('Action.Cancel')}
          </Button>
        </div>
      </NativeFooter>
      <div className='text-content-editor-footer-desktop'>
        <div className={classNames('text-content-editor-buttons-desktop', 'justify-start')}>
          {!isEditingPublished && (
            <Button
              as='button'
              size='Medium'
              variant='Emphasis'
              data-testid='announcement-composer-publish'
              isDisabled={isPublishDisabled || isLoading}
              onClick={onPublish}>
              {translate('Action.Publish')}
            </Button>
          )}
          <Button
            as='button'
            size='Medium'
            variant='SoftEmphasis'
            data-testid='announcement-composer-save-draft'
            isDisabled={isSaveDisabled || isSaveLoading}
            onClick={onSubmitClicked}>
            {submitText}
          </Button>
          <Button as='button' size='Medium' variant='Standard' onClick={onBack}>
            {translate('Action.Cancel')}
          </Button>
        </div>
        <div className='announcement-footer-status-slot' style={{ minHeight: '48px' }}>
          {showInlineProgress && (
            <InlineProgressLoader
              variant='Indeterminate'
              size='Medium'
              text={inlineProgressText}
              textClassNames={['text-body-large']}
              ariaLabel={translate('Label.Loading')}
            />
          )}
          {errorKey ? <TextContentEditorError message={translate(errorKey)} /> : null}
        </div>
      </div>
    </React.Fragment>
  );
};

AnnouncementFooterControls.displayName = 'AnnouncementFooterControls';

export default withTranslations(AnnouncementFooterControls, groupAnnouncementsConfig);
