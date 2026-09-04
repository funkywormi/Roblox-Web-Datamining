import { create } from 'zustand';

export type AuditContentValue = {
  translationKey: string;
  translationNamespace: string;
  translatedSourceString: string;
  parameters?: Record<string, string>;
};

interface AuditContentState {
  capturedAuditContent: Record<string, AuditContentValue>;
  additionalAuditContent: Record<string, string>;
  setCapturedAuditContentItem: (key: string, value: AuditContentValue) => void;
  removeCapturedAuditContentItem: (key: string) => void;
  setAdditionalAuditContentItem: (key: string, value: string) => void;
  removeAdditionalAuditContentItem: (key: string) => void;
}

const useAuditContentState = create<AuditContentState>(set => ({
  capturedAuditContent: {},
  additionalAuditContent: {},
  setCapturedAuditContentItem: (key, value) => {
    set(state => {
      const newState = { ...state.capturedAuditContent, [key]: value };
      return { capturedAuditContent: newState };
    });
  },
  removeCapturedAuditContentItem: key => {
    set(state => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = state.capturedAuditContent;
      return { capturedAuditContent: rest };
    });
  },
  setAdditionalAuditContentItem: (key, value) => {
    set(state => {
      const newState = { ...state.additionalAuditContent, [key]: value };
      return { additionalAuditContent: newState };
    });
  },
  removeAdditionalAuditContentItem: key => {
    set(state => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [key]: _, ...rest } = state.additionalAuditContent;
      return { additionalAuditContent: rest };
    });
  }
}));

export default useAuditContentState;
