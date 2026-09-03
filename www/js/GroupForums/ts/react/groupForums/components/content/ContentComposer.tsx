/* eslint-disable user-communities/no-large-components */
import React, { ReactNode, useCallback, useState, useMemo, useRef } from 'react';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { Button } from '@rbx/foundation-ui';
import { RichTextEditorHandle } from '@rbx/richtext-editor';
import { groupsConfig } from '../../translation.config';
import EditableContentFieldInput, {
  EditableContentFieldHandle,
  HotKeyType
} from '../../../shared/components/content/EditableContentFieldInput';
import AccessibleDivButton from '../../../shared/components/AccessibleDivButton';
import { GetForumCommentContentValidationErrorKey } from '../../utils/groupForumsValidation';
import useForumsRateLimitCountdown from '../../hooks/useForumsRateLimitCountdown';
import { MessageContent } from '../../../shared/types';
import useStatefulForm from '../../../shared/hooks/useStatefulForm';
import useValidationError from '../../../shared/hooks/useValidationError';

const VALIDATION_DEBOUNCE_MS = 500;

export type ContentComposerProps = {
  className?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<EditableContentFieldHandle>;
  editorRef?: React.RefObject<RichTextEditorHandle>;
  defaultContent?: MessageContent;
  errorMessage?: string;
  label?: ReactNode;
  disabled?: boolean;
  submitDisabled?: boolean;
  isCollapsedInitially?: boolean;
  onChange?: (value: MessageContent) => void;
  onSubmit: (value: MessageContent) => Promise<boolean>;
  onCancel?: () => void;
  onClose?: () => void;
} & WithTranslationsProps;

const ContentComposer = ({
  className,
  autoFocus,
  defaultContent,
  errorMessage,
  label,
  disabled,
  submitDisabled,
  onChange,
  onSubmit,
  onCancel,
  onClose,
  inputRef,
  editorRef,
  translate,
  isCollapsedInitially
}: ContentComposerProps): JSX.Element => {
  const [content, setContent] = useState<MessageContent | undefined>(defaultContent);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { updateFormItem, resetForm, formStatus } = useStatefulForm([
    {
      id: 'content',
      initialValue: content || { plainText: '' }
    }
  ]);

  const backupRef = useRef<EditableContentFieldHandle>(null);
  const commentComposerRef = inputRef || backupRef;

  const contentValidationError = useValidationError(
    content || { plainText: '' },
    GetForumCommentContentValidationErrorKey,
    translate,
    VALIDATION_DEBOUNCE_MS
  );

  const { isActive: isRateLimited, remainingSeconds } = useForumsRateLimitCountdown('comment');
  const inlineValidationError = useMemo(() => {
    if (isRateLimited && remainingSeconds > 0 && !disabled) {
      return translate('Error.RetryAfterSeconds', { seconds: remainingSeconds });
    }

    return contentValidationError;
  }, [isRateLimited, remainingSeconds, disabled, contentValidationError, translate]);

  const onContentChanged = useCallback(
    (value: MessageContent) => {
      setContent(value);
      updateFormItem('content', {
        valid: !GetForumCommentContentValidationErrorKey(value, false),
        currentValue: value
      });
      onChange?.(value);
    },
    [onChange, updateFormItem]
  );

  const onCancelClicked = useCallback(() => {
    inputRef?.current?.clearText();
    editorRef?.current?.clear();
    resetForm();
    setContent(undefined);
    onCancel?.();
  }, [inputRef, editorRef, resetForm, onCancel]);

  const onSubmitClicked = useCallback(async () => {
    if (!content) {
      return;
    }

    setIsSubmitting(true);
    const isSaved = await onSubmit(content);
    if (isSaved) {
      resetForm();
    }
    setIsSubmitting(false);
  }, [content, onSubmit, resetForm]);

  const isSubmitDisabled = useMemo(() => {
    return disabled || submitDisabled || !formStatus.isValidAndUnsaved || isRateLimited;
  }, [formStatus, disabled, submitDisabled, isRateLimited]);

  const handleHotKey = (hotKeyPressed: HotKeyType) => {
    if (hotKeyPressed === HotKeyType.Submit && !isSubmitDisabled) {
      // eslint-disable-next-line no-void
      void onSubmitClicked();
    }
  };

  return (
    <div className={classNames('content-composer', className)}>
      {label && (
        <div className='content-composer-header'>
          <div className='content-composer-label'>{label}</div>
          {onClose && (
            <AccessibleDivButton
              aria-label={translate('Action.Close')}
              onClick={onClose}
              className='content-composer-close-button'>
              <span className='content-composer-close-icon' />
            </AccessibleDivButton>
          )}
        </div>
      )}
      <div className='content-composer-body'>
        <EditableContentFieldInput
          ref={commentComposerRef}
          editorRef={editorRef}
          className='content-composer-textarea'
          textAreaClassName='content-composer-textarea-input'
          placeholder={translate('Label.WriteComment')}
          defaultValue={defaultContent}
          showCharacterCount={false}
          maxTextFieldHeight={100}
          locked={disabled}
          validationError={inlineValidationError}
          onChange={onContentChanged}
          onHotKey={handleHotKey}
          autoFocus={autoFocus}
          isRichTextEnabled
          isCollapsedInitially={isCollapsedInitially}
          autoResize
        />
        <div className='content-composer-footer'>
          <div className='content-composer-buttons'>
            {!!onCancel && (
              <Button
                variant='Standard'
                size='Small'
                onClick={onCancelClicked}
                isDisabled={disabled}>
                {translate('Action.Cancel')}
              </Button>
            )}
            <Button
              variant='Emphasis'
              size='Small'
              onClick={onSubmitClicked}
              isDisabled={isSubmitDisabled}
              isLoading={isSubmitting}>
              {translate('Action.Post')}
            </Button>
          </div>
          {!!errorMessage && (
            <div
              className={classNames('content-composer-error', {
                'content-composer-validation-error': formStatus.isInvalid
              })}>
              <div className='content-composer-error-icon'>
                <span className='icon-status-alert' />
              </div>
              <div
                className={classNames('content-composer-error-message', {
                  'content-composer-validation-error-message text-error': formStatus.isInvalid
                })}>
                {errorMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default withTranslations(ContentComposer, groupsConfig);
