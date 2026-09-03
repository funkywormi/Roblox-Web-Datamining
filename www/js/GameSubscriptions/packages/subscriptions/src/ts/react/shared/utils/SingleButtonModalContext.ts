/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext } from 'react';

export interface SingleButtonModalContext {
  openModal: () => void;
  closeModal: () => void;
  updateModalContent: (
    heading: string,
    bodyText: string,
    buttonText: string,
    showErrorIcon: boolean,
    buttonOnPress: () => void,
    secondarylButtonText?: string
  ) => void;
}

const singleButtonModalContext = createContext<SingleButtonModalContext>({
  openModal: () => ({}),
  closeModal: () => ({}),
  updateModalContent: (
    _heading: string,
    _bodyText: string,
    _buttonText: string,
    _showErrorIcon: boolean,
    _buttonOnPress: () => void,
    _secondaryButtonText?: string
  ) => ({})
});
singleButtonModalContext.displayName = 'singleButtonModal';

export default singleButtonModalContext;
