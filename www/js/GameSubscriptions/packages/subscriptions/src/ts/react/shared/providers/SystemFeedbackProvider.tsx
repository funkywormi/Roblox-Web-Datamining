import React from 'react';
import { createSystemFeedback } from 'react-style-guide';
import SystemFeedbackContext from '../utils/SystemFeedbackContext';

const SystemFeedbackProvider: React.FC = ({ children }) => {
  const [SystemFeedback, systemFeedbackService] = createSystemFeedback();
  const contextValue = {
    SystemFeedback,
    systemFeedbackService
  };
  return (
    <SystemFeedbackContext.Provider value={contextValue}>{children}</SystemFeedbackContext.Provider>
  );
};

export default SystemFeedbackProvider;
