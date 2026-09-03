import React from 'react';
import classNames from 'classnames';

export type SingleLineInputFieldProps = {
  id: string;
  className?: string;
  subtextClassName?: string;
  value: string;
  onChange: (keywords: string) => void;
  placeholder?: string;
  maxLength: number;
  errorMessage: string | null;
  showCharacterCount?: boolean;
};

const SingleLineInputField = ({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  errorMessage,
  showCharacterCount,
  className,
  subtextClassName
}: SingleLineInputFieldProps): JSX.Element => {
  const characterCountLabel = `${value.length}/${maxLength}`;
  return (
    <div
      className={classNames(
        className,
        'input-field-container flex flex-col form-has-feedback',
        errorMessage && 'form-has-error'
      )}>
      <input
        id={id}
        className='form-control input-field'
        type='text'
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
      />
      {!errorMessage && showCharacterCount && (
        <p className={classNames(subtextClassName, 'form-control-label self-end')}>
          {characterCountLabel}
        </p>
      )}
      {errorMessage && (
        <p className={classNames(subtextClassName, 'form-control-label self-end')}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default SingleLineInputField;
