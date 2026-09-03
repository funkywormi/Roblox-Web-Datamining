import React, { createContext, useContext } from 'react';
import { FormStatus } from '../../hooks/useStatefulForm';

export interface TextContentEditorContextValue {
  formStatus: FormStatus;
  isSubmitting: boolean;
  isLoading?: boolean;
  isCountdownActive: boolean;
  onSubmitClicked: () => Promise<void>;
  onBack: () => void;
  submitText: string;
  errorKey?: string | null;
  showInlineProgress: boolean;
  inlineProgressText: string;
}

const TextContentEditorContext = createContext<TextContentEditorContextValue | null>(null);

export const useTextContentEditorContext = (): TextContentEditorContextValue => {
  const context = useContext(TextContentEditorContext);
  if (!context) {
    throw new Error(
      'useTextContentEditorContext must be used within TextContentEditorContext.Provider'
    );
  }
  return context;
};

export default TextContentEditorContext;
