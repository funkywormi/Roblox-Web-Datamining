import React, { useRef } from 'react';
import classNames from 'classnames';
import { allowedEffectTypes } from './constants/allowedEffectTypes';
import { createKeyboardEventHandler } from './utils/accessibility';
import { FileValidationOptions, ValidationError } from './types';
import { validateFiles } from './utils/validation';

type FileUploadBaseProps = {
  className?: string | null;
  onChange?: ((files: FileList) => void) | null;
  children?:
    | ((
        onClick: () => void,
        onKeyDown: (e: React.KeyboardEvent | React.SyntheticEvent) => void,
        onDrop: (e: React.DragEvent) => void,
        onDragOverOrEnter: (e: React.DragEvent) => void
      ) => React.ReactNode)
    | null;
  validation?: FileValidationOptions;
  onValidationError?: (errors: ValidationError[]) => void;
  blockOnValidationError?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'children' | 'className'>;

const FileUploadBase: React.FC<FileUploadBaseProps> = ({
  className,
  onChange,
  children,
  validation,
  onValidationError,
  blockOnValidationError = false,
  ...otherProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const onKeyDown = createKeyboardEventHandler(
    onClick,
    [/** for IE 11 */ 'Spacebar', ' ', 'Enter'],
    true
  );

  const handleFiles = (files: FileList): void => {
    let shouldProceed = true;

    if (validation) {
      const errors = validateFiles(files, validation);

      if (errors.length > 0) {
        if (onValidationError) {
          onValidationError(errors);
        }

        if (blockOnValidationError) {
          shouldProceed = false;
        }
      }
    }

    if (shouldProceed && onChange) {
      onChange(files);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { target } = e;
    if (target.files) {
      handleFiles(target.files);
    }

    /**
     * Clear the stored files for the following reasons:
     * 1) This core component is meant to be stateless (already true for drag and drop case),
     * hence it should reset it self after handling over the files data.
     * 2) The browser's file input will re-fire the change event iff a file with a different name
     * is re-selected. Thus if we don't actually reset the input, it will cause issues for case
     * where the consumer need to allow "deletion".
     *
     * If you find that you need to expose more info (i.e. info for the event object) to the consumer,
     * please consider re-design the widget instead of approaches like pass it as an additional argument to
     * this.props.onChange.
     */
    target.value = '';
  };

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    const {
      dataTransfer: { files }
    } = e;

    handleFiles(files);
  };

  const onDragOverOrEnter = (e: React.DragEvent): void => {
    e.preventDefault();
    // TODO: old, migrated code
    // eslint-disable-next-line no-param-reassign
    e.dataTransfer.effectAllowed = allowedEffectTypes.copy;
  };

  const fileUploadBaseClasses = classNames(
    className,
    'file-upload-container',
    'cursor-pointer',
    'full-screen'
  );
  const userInterface = children ? children(onClick, onKeyDown, onDrop, onDragOverOrEnter) : null;
  return (
    <div className={fileUploadBaseClasses}>
      {userInterface}
      <input
        {...otherProps}
        ref={inputRef}
        type='file'
        className='file-upload-input hidden'
        onChange={onFileChange}
        accept={validation?.accept || undefined}
      />
    </div>
  );
};

FileUploadBase.displayName = 'FileUpload';

export default FileUploadBase;
