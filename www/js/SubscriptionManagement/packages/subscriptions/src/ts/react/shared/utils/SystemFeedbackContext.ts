import { createContext } from 'react';
import { TSystemFeedbackComponent, TSystemFeedbackService } from 'react-style-guide';

export type SystemFeedbackContextValue = {
  SystemFeedback: TSystemFeedbackComponent;
  systemFeedbackService: TSystemFeedbackService;
};

const SystemFeedbackContext = createContext<SystemFeedbackContextValue | null>(null);

export default SystemFeedbackContext;
