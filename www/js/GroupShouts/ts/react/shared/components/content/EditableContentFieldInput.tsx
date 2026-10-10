import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  KeyboardEvent
} from 'react';
import { useTranslation, TranslationProvider } from 'react-utilities';
import { Document } from '@rbx/richtext';
import classNames from 'classnames';
import { RichTextEditor, RichTextEditorHandle, getPlaintextLength } from '@rbx/richtext-editor';
import { groupsConfig } from '../../translation.config';
import { MessageContent } from '../../types';
import { parseDocument } from '../../utils/messageContentUtils';
import useViewportSize from '../../hooks/useViewportSize';
import webLinkRenderer from './WebLink';

const WEB_LINK_RENDERERS = [webLinkRenderer];

export enum HotKeyType {
  Submit = 'HotKey:Submit'
}

const isSubmitHotKey = (event: KeyboardEvent<HTMLTextAreaElement>): boolean => {
  const platform = navigator?.platform ?? '';
  const isApple = /Mac|iPod|iPhone|iPad/.test(platform);

  return (isApple ? event.metaKey : event.ctrlKey) && event.key === 'Enter';
};

export type EditableContentFieldInputProps = {
  className?: string;
  textAreaClassName?: string;
  defaultValue?: MessageContent;
  placeholder?: string;
  maxLength?: number;
  fieldName?: string;
  showCharacterCount?: boolean;
  autoResize?: boolean;
  autoFocus?: boolean;
  maxTextFieldHeight?: number;
  locked?: boolean;
  validationError?: string;
  onChange?: (value: MessageContent) => void;
  onHotKey?: (hotKeyType: HotKeyType) => void;
  isRichTextEnabled: boolean;
  isCollapsedInitially?: boolean;
  minHeight?: 'Small' | 'Medium';
  editorRef?: React.RefObject<RichTextEditorHandle>;
  /**
   * Control rendered inline at the start of the editor's bottom control row,
   * before the built-in toolbar toggle ("Aa"). Rich-text mode only.
   */
  leadingControl?: React.ReactNode;
  /**
   * Content rendered as a flow block below the editable text and above the
   * control row (e.g. an attachment chip). Rich-text mode only.
   */
  footer?: React.ReactNode;
  /** When false, a URL the editor turns into a link stays plain text. Rich-text mode only. */
  isLinkAuthoringEnabled?: boolean;
};

export type EditableContentFieldHandle = {
  clearText: () => void;
  setText: (value: string) => void;
  focus: () => void;
};

const EditableContentFieldInputInner = forwardRef<
  EditableContentFieldHandle,
  EditableContentFieldInputProps
>(
  (props, ref): JSX.Element => {
    const { translate } = useTranslation();
    const {
      className,
      textAreaClassName,
      defaultValue,
      placeholder,
      maxLength = 1000,
      fieldName,
      showCharacterCount = true,
      autoResize = false,
      autoFocus = false,
      locked = false,
      maxTextFieldHeight = -1,
      validationError,
      onChange,
      onHotKey,
      isRichTextEnabled,
      isCollapsedInitially,
      minHeight,
      editorRef,
      leadingControl,
      footer,
      isLinkAuthoringEnabled = false
    } = props;

    const [slateValue, setSlateValue] = useState<Document | undefined>(undefined);

    const [text, setText] = useState<string>('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    // Not every caller passes an editorRef, and focusing the rich text editor needs a handle.
    const fallbackEditorRef = useRef<RichTextEditorHandle>(null);
    const richTextEditorRef = editorRef ?? fallbackEditorRef;

    const handleRichTextChange = useCallback(
      (value: Document) => {
        setSlateValue(value);
        onChange?.({ slate: value });
      },
      [onChange]
    );
    const handleChange = useCallback(
      (value: string) => {
        setText(value);
        onChange?.({ plainText: value });
      },
      [onChange]
    );

    useImperativeHandle(ref, () => ({
      clearText: () => {
        if (textAreaRef.current) {
          textAreaRef.current.value = '';
        }
        setText('');
        handleChange('');
      },
      setText: (value: string) => {
        if (textAreaRef.current) {
          textAreaRef.current.value = value;
        }
        handleChange(value);
      },
      focus: () => {
        if (textAreaRef.current) {
          textAreaRef.current.focus();
        } else {
          richTextEditorRef.current?.focus();
        }
      }
    }));

    const characterCountLabel = useMemo(() => {
      if (!maxLength) {
        return null;
      }

      if (isRichTextEnabled && slateValue) {
        const textLength = getPlaintextLength(slateValue);
        return `${textLength}/${maxLength}`;
      }

      return `${text.length}/${maxLength}`;
    }, [maxLength, isRichTextEnabled, slateValue, text.length]);

    useEffect(() => {
      if (!autoResize || !textAreaRef.current) return;
      textAreaRef.current.style.height = ''; // reset height for next calculation
      let newHeight = textAreaRef.current.scrollHeight + 3;
      if (maxTextFieldHeight > 0 && newHeight > maxTextFieldHeight) {
        newHeight = maxTextFieldHeight;
      }
      textAreaRef.current.style.height = `${newHeight}px`;
    }, [text, autoResize, maxTextFieldHeight]);

    useEffect(() => {
      if (!autoFocus || locked) return;

      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const { textLength } = textAreaRef.current;
        textAreaRef.current.setSelectionRange(textLength, textLength);
        return;
      }

      richTextEditorRef.current?.focus();
    }, [autoFocus, locked, richTextEditorRef]);

    const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (isSubmitHotKey(event)) {
        onHotKey?.(HotKeyType.Submit);
      }
    };

    const { isSmallViewport } = useViewportSize();

    const defaultSlateValue = useMemo(() => {
      const parsed = parseDocument(defaultValue || {});
      if (parsed) {
        return parsed;
      }

      return undefined;
    }, [defaultValue]);
    return (
      <div className={classNames('editable-content-field-input', className)}>
        {isRichTextEnabled ? (
          <RichTextEditor
            ref={richTextEditorRef}
            placeholder={placeholder}
            initialValue={defaultSlateValue}
            onChange={handleRichTextChange}
            isToolbarVisibleInitially={!isSmallViewport}
            isCollapsedInitially={isCollapsedInitially}
            minHeight={minHeight}
            isDisabled={locked}
            leadingControls={leadingControl}
            footer={footer}
            translate={translate}
            renderers={WEB_LINK_RENDERERS}
            isLinkAuthoringEnabled={isLinkAuthoringEnabled}
          />
        ) : (
          <textarea
            className={classNames('input-field', textAreaClassName)}
            name={fieldName}
            placeholder={placeholder}
            maxLength={maxLength}
            onChange={e => handleChange(e.target.value)}
            disabled={locked}
            {...(locked ? { 'aria-disabled': true } : {})}
            onKeyPress={handleKeyPress}
            ref={textAreaRef}
            defaultValue={defaultValue?.plainText}
          />
        )}
        <div
          className={classNames(
            'editable-content-field-input-metadata',
            fieldName ? `field-${fieldName}` : undefined
          )}>
          {validationError && <p className='text-error'>{validationError}</p>}
          {showCharacterCount && characterCountLabel && (
            <p className='form-control-label small text character-count'>{characterCountLabel}</p>
          )}
        </div>
      </div>
    );
  }
);

EditableContentFieldInputInner.displayName = 'EditableContentFieldInputInner';

const EditableContentFieldInput = forwardRef<
  EditableContentFieldHandle,
  EditableContentFieldInputProps
>((props, ref) => (
  <TranslationProvider config={groupsConfig}>
    <EditableContentFieldInputInner ref={ref} {...props} />
  </TranslationProvider>
));

EditableContentFieldInput.displayName = 'EditableContentFieldInput';

export default EditableContentFieldInput;
