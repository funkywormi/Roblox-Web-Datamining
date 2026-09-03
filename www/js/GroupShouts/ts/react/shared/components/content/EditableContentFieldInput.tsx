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
      footer
    } = props;

    const [slateValue, setSlateValue] = useState<Document | undefined>(undefined);

    const [text, setText] = useState<string>('');
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
        textAreaRef.current?.focus();
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
      if (autoFocus) {
        textAreaRef.current?.focus();
        const textLength = textAreaRef.current?.textLength ?? 0;
        textAreaRef.current?.setSelectionRange(textLength, textLength);
      }
    }, [autoFocus]);

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
            ref={editorRef}
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
