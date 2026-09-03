import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Button } from '@rbx/foundation-ui';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../translation.config';
import CreateContentButton from './CreateContentButton';
import TextContentEditorError from './TextContentEditorError';
import NativeFooter from '../NativeFooter';
import InlineProgressLoader from '../InlineProgressLoader';
import { useTextContentEditorContext } from './TextContentEditorContext';
import { FormStatus } from '../../hooks/useStatefulForm';

export type DefaultTextContentEditorControlsProps = {
  submitDisabled?: boolean;
  SubmitButton?: React.ComponentType<{
    label: string;
    onClick: (() => void) | (() => Promise<void>);
    disabled?: boolean;
  }>;
  getIsSubmitDisabled?: (formStatus: FormStatus) => boolean;
} & WithTranslationsProps;

const DefaultTextContentEditorControls = ({
  submitDisabled,
  SubmitButton = CreateContentButton,
  getIsSubmitDisabled,
  translate
}: DefaultTextContentEditorControlsProps): JSX.Element => {
  const {
    formStatus,
    isSubmitting,
    isLoading,
    isCountdownActive,
    onSubmitClicked,
    onBack,
    submitText,
    errorKey,
    showInlineProgress,
    inlineProgressText
  } = useTextContentEditorContext();

  const isDisabled = useMemo<boolean>(() => {
    const formDisabled = getIsSubmitDisabled
      ? getIsSubmitDisabled(formStatus)
      : !formStatus.isValidAndUnsaved;

    return submitDisabled || isSubmitting || isLoading || formDisabled || isCountdownActive;
  }, [submitDisabled, isSubmitting, isLoading, formStatus, isCountdownActive, getIsSubmitDisabled]);

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
          <SubmitButton label={submitText} onClick={onSubmitClicked} disabled={isDisabled} />
        </div>
      </NativeFooter>
      <div className='text-content-editor-footer-desktop'>
        <div className={classNames('text-content-editor-buttons-desktop', 'justify-start')}>
          <SubmitButton label={submitText} onClick={onSubmitClicked} disabled={isDisabled} />
          <Button
            className='text-content-editor-cancel'
            type='button'
            variant='Standard'
            size='Medium'
            onClick={onBack}>
            {translate('Action.Cancel')}
          </Button>
          {showInlineProgress && (
            <InlineProgressLoader
              variant='Indeterminate'
              size='Medium'
              text={inlineProgressText}
              textClassNames={['text-body-large']}
              ariaLabel={translate('Label.Loading')}
            />
          )}
        </div>
        {errorKey ? <TextContentEditorError message={translate(errorKey)} /> : null}
      </div>
    </React.Fragment>
  );
};

DefaultTextContentEditorControls.displayName = 'DefaultTextContentEditorControls';

export default withTranslations(DefaultTextContentEditorControls, groupsConfig);
