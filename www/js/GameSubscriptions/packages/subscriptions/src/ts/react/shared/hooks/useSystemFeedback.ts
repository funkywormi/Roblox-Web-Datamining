import { useContext } from 'react';
import SystemFeedbackContext, { SystemFeedbackContextValue } from '../utils/SystemFeedbackContext';

const useSystemFeedbackContext = (): SystemFeedbackContextValue => {
  const context = useContext(SystemFeedbackContext);
  if (context === null) {
    throw new Error('System feedback context was not provided in the current scope!');
  }
  return context;
};

export default useSystemFeedbackContext;
