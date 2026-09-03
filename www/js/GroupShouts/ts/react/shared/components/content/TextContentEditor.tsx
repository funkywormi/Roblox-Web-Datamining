import React, { useCallback, useState, useMemo } from 'react';
import { Loading } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import classNames from 'classnames';
import { groupsConfig } from '../../translation.config';
import EditableContentFieldInput, { HotKeyType } from './EditableContentFieldInput';
import SectionHeader from '../SectionHeader';
import CreateContentButton from './CreateContentButton';
import DefaultTextContentEditorControls from './DefaultTextContentEditorControls';
import TextContentEditorContext from './TextContentEditorContext';
import { UseCountdownResult } from '../../hooks/useCountdown';
import useValidationError from '../../hooks/useValidationError';
import { MessageContent } from '../../types';
import useStatefulForm from '../../hooks/useStatefulForm';

export type TextContentEditorProps = {
  hasTitle: boolean;
  headerText: string;
  contentPlaceholder: string;
  submitText: string;
  submitDisabled?: boolean;
  customControls?: JSX.Element;
  titleMaxLength?: number;
  contentMaxLength: number;
  defaultTitle?: string;
  defaultContent?: MessageContent;
  titleLocked?: boolean;
  errorKey?: string | null;
  onSubmit: (params: { title: string; content: MessageContent }) => Promise<boolean>;
  onBack: () => void;
  onChange?: (params: { title: string; content: MessageContent }) => void;
  isLoading?: boolean;
  SubmitButton?: React.ComponentType<{
    label: string;
    onClick: (() => void) | (() => Promise<void>);
    disabled?: boolean;
  }>;
  titleLabel?: string;
  contentLabel?: string;
  childLabel?: string;
  getContentValidationErrorKey?: (content: MessageContent) => string | undefined;
  getTitleValidationErrorKey?: (title: MessageContent) => string | undefined;
  useInlineProgressIndicator?: boolean;
  inlineProgressVisible?: boolean;
  inlineProgressText?: string;
  countdown?: UseCountdownResult;
  isRichTextEnabled: boolean;
  children?: React.ReactNode;
  footerControls?: React.ReactNode;
  /** Control rendered inline before the content editor's toolbar toggle ("Aa"). */
  contentLeadingControl?: React.ReactNode;
  /** Flow content rendered below the content editor's text, above its control row. */
  contentFooter?: React.ReactNode;
} & WithTranslationsProps;

const VALIDATION_DEBOUNCE_MS = 500;

const TextContentEditor = ({
  hasTitle,
  headerText,
  contentPlaceholder,
  submitText,
  submitDisabled,
  customControls,
  titleMaxLength,
  contentMaxLength,
  defaultTitle,
  defaultContent,
  titleLocked,
  errorKey,
  onSubmit,
  onBack,
  onChange,
  isRichTextEnabled,
  isLoading,
  SubmitButton = CreateContentButton,
  titleLabel,
  contentLabel,
  childLabel,
  getContentValidationErrorKey,
  getTitleValidationErrorKey,
  children,
  useInlineProgressIndicator = false,
  inlineProgressVisible = false,
  inlineProgressText = '',
  countdown,
  footerControls,
  contentLeadingControl,
  contentFooter,
  translate
}: TextContentEditorProps): JSX.Element => {
  const [title, setTitle] = useState<MessageContent>(
    defaultTitle ? { plainText: defaultTitle } : { plainText: '' }
  );
  const [content, setContent] = useState<MessageContent>(defaultContent ?? { plainText: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fields = [
    {
      id: 'content',
      initialValue: content
    }
  ];

  if (!titleLocked) {
    fields.push({
      id: 'title',
      initialValue: title
    });
  }

  const { resetForm, updateFormItem, formStatus } = useStatefulForm(fields);

  const contentValidationError = useValidationError(
    content,
    getContentValidationErrorKey,
    translate,
    VALIDATION_DEBOUNCE_MS
  );

  const titleValidationError = useValidationError(
    title,
    getTitleValidationErrorKey,
    translate,
    VALIDATION_DEBOUNCE_MS
  );

  const onSubmitClicked = useCallback(async () => {
    setIsSubmitting(true);
    const isSaved = await onSubmit({ title: title.plainText || '', content });
    if (isSaved) {
      resetForm();
    }
    setIsSubmitting(false);
  }, [title, content, onSubmit, resetForm]);

  const onTitleChanged = useCallback(
    (value: MessageContent) => {
      setTitle(value);
      updateFormItem('title', {
        valid: !getTitleValidationErrorKey?.(value),
        currentValue: value
      });
      onChange?.({ title: value.plainText || '', content });
    },
    [updateFormItem, getTitleValidationErrorKey, onChange, content]
  );

  const onContentChanged = useCallback(
    (value: MessageContent) => {
      setContent(value);
      updateFormItem('content', {
        valid: !getContentValidationErrorKey?.(value),
        currentValue: value
      });
      onChange?.({ title: title.plainText || '', content: value });
    },
    [updateFormItem, getContentValidationErrorKey, onChange, title.plainText]
  );

  const showInlineProgress = useMemo(
    () => Boolean(useInlineProgressIndicator) && Boolean(inlineProgressVisible || isSubmitting),
    [inlineProgressVisible, useInlineProgressIndicator, isSubmitting]
  );

  const isSubmitDisabled = useMemo<boolean>(() => {
    return (
      submitDisabled ||
      isSubmitting ||
      isLoading ||
      !formStatus.isValidAndUnsaved ||
      (countdown ? countdown.isActive : false)
    );
  }, [submitDisabled, isSubmitting, isLoading, formStatus, countdown]);

  const handleHotKey = (hotKeyPressed: HotKeyType) => {
    if (hotKeyPressed === HotKeyType.Submit && !isSubmitDisabled) {
      // eslint-disable-next-line no-void
      void onSubmitClicked();
    }
  };

  const defaultTextValue = useMemo(() => {
    return { plainText: defaultTitle };
  }, [defaultTitle]);

  const contextValue = useMemo(
    () => ({
      formStatus,
      isSubmitting,
      isLoading,
      isCountdownActive: countdown ? countdown.isActive : false,
      onSubmitClicked,
      onBack,
      submitText,
      errorKey,
      showInlineProgress,
      inlineProgressText
    }),
    [
      formStatus,
      isSubmitting,
      isLoading,
      countdown,
      onSubmitClicked,
      onBack,
      submitText,
      errorKey,
      showInlineProgress,
      inlineProgressText
    ]
  );

  return (
    <TextContentEditorContext.Provider value={contextValue}>
      <div className='text-content-editor'>
        <SectionHeader headerText={headerText} onBack={onBack} />
        {!!customControls && (
          <div className='text-content-editor-controls'>
            {customControls}
            <hr className='text-content-editor-divider' />
          </div>
        )}
        <div className='text-content-editor-body'>
          {isLoading ? (
            <Loading />
          ) : (
            <React.Fragment>
              {hasTitle && (
                <React.Fragment>
                  {titleLabel && <h5 className='text-content-editor-label'>{titleLabel}</h5>}
                  <EditableContentFieldInput
                    textAreaClassName={classNames(
                      'text-content-editor-title',
                      titleLocked && 'text-content-editor-title-locked',
                      'radius-medium stroke-standard content-emphasis placeholder:content-muted stroke-contrast-alpha'
                    )}
                    fieldName='title'
                    defaultValue={defaultTextValue}
                    placeholder={translate('Label.Title')}
                    maxLength={titleMaxLength}
                    onChange={onTitleChanged}
                    locked={titleLocked || isSubmitting}
                    autoResize
                    validationError={titleValidationError}
                    isRichTextEnabled={false}
                  />
                </React.Fragment>
              )}
              {contentLabel && <h5 className='text-content-editor-label'>{contentLabel}</h5>}
              <EditableContentFieldInput
                className='text-content-editor-content-container'
                textAreaClassName='text-content-editor-content radius-medium stroke-standard content-emphasis placeholder:content-muted stroke-contrast-alpha'
                fieldName='content'
                defaultValue={defaultContent}
                placeholder={contentPlaceholder ?? translate('Label.WriteSomething')}
                maxLength={contentMaxLength}
                onChange={onContentChanged}
                onHotKey={handleHotKey}
                autoResize
                isRichTextEnabled={isRichTextEnabled}
                isCollapsedInitially={hasTitle ? false : undefined}
                minHeight={hasTitle ? 'Medium' : undefined}
                leadingControl={contentLeadingControl}
                footer={contentFooter}
                validationError={
                  countdown?.isActive
                    ? translate('Error.RetryAfterSeconds', {
                        seconds: countdown?.remainingSeconds ?? 0
                      })
                    : contentValidationError
                }
                locked={isSubmitting}
              />
              {childLabel && <h5 className='text-content-editor-label'>{childLabel}</h5>}
              {children}
            </React.Fragment>
          )}
        </div>
        {footerControls ?? (
          <DefaultTextContentEditorControls
            submitDisabled={isSubmitDisabled}
            SubmitButton={SubmitButton}
          />
        )}
      </div>
    </TextContentEditorContext.Provider>
  );
};

TextContentEditor.displayName = 'TextContentEditor';

export default withTranslations(TextContentEditor, groupsConfig);
