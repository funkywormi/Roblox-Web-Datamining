import React from 'react';

export type TextContentEditorErrorProps = {
  message: string;
};

const TextContentEditorError = ({ message }: TextContentEditorErrorProps): JSX.Element => {
  return (
    <div className='text-content-editor-error'>
      <span className='icon-warning' />
      <p className='text-content-editor-error-message'>{message}</p>
    </div>
  );
};

TextContentEditorError.displayName = 'TextContentEditorError';

export default TextContentEditorError;
