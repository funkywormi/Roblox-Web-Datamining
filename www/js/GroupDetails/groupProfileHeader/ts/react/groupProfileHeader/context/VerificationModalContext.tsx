import React, { createContext, useContext, useState, useCallback } from 'react';
import { VerificationLevel } from '../constants/verificationConstants';

interface VerificationModalState {
  isOpen: boolean;
  verificationLevel: VerificationLevel | null;
}

interface VerificationModalContextValue {
  modalState: VerificationModalState;
  openVerificationModal: (verificationLevel: VerificationLevel) => void;
  closeVerificationModal: () => void;
}

const VerificationModalContext = createContext<VerificationModalContextValue | undefined>(
  undefined
);

export const useVerificationModal = (): VerificationModalContextValue => {
  const context = useContext(VerificationModalContext);
  if (!context) {
    throw new Error('useVerificationModal must be used within a VerificationModalProvider');
  }
  return context;
};

export const VerificationModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [modalState, setModalState] = useState<VerificationModalState>({
    isOpen: false,
    verificationLevel: null
  });

  const openVerificationModal = useCallback((verificationLevel: VerificationLevel) => {
    setModalState({ isOpen: true, verificationLevel });
  }, []);

  const closeVerificationModal = useCallback(() => {
    setModalState({ isOpen: false, verificationLevel: null });
  }, []);

  const value: VerificationModalContextValue = {
    modalState,
    openVerificationModal,
    closeVerificationModal
  };

  return (
    <VerificationModalContext.Provider value={value}>{children}</VerificationModalContext.Provider>
  );
};
