import React, { createContext, useContext, useCallback, useMemo, useRef, useState } from "react";
import { Snackbar } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

export type SystemFeedback = {
  error: (message: string) => void;
  loading: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  clear: () => void;
};

type SystemFeedbackContextType = SystemFeedback;

type FeedbackType = "error" | "loading" | "success" | "warning" | "info";

type ActiveFeedback = {
  id: number;
  type: FeedbackType;
  message: string;
};

const SystemFeedbackContext = createContext<SystemFeedbackContextType | undefined>(undefined);

const getFeedbackIcon = (type: FeedbackType) => {
  switch (type) {
    case "success":
      return "icon-filled-check" as const;
    case "info":
      return "icon-filled-circle-i" as const;
    case "error":
    case "warning":
      return "icon-filled-triangle-exclamation" as const;
    case "loading":
    default:
      return undefined;
  }
};

export const useSystemFeedback = (): SystemFeedback => {
  const context = useContext(SystemFeedbackContext);
  if (!context) {
    throw new Error("useSystemFeedback must be used within a SystemFeedbackProvider");
  }
  return context;
};

interface SystemFeedbackProviderProps {
  children: React.ReactNode;
}

export const SystemFeedbackProvider: React.FC<SystemFeedbackProviderProps> = ({ children }) => {
  const { translate } = useTranslation();
  const [feedback, setFeedback] = useState<ActiveFeedback | null>(null);
  const idRef = useRef(0);

  const translateIfKey = useCallback(
    (message: string): string => {
      const translated = translate(message);
      return translated !== message ? translated : message;
    },
    [translate],
  );

  const show = useCallback(
    (type: FeedbackType, message: string) => {
      idRef.current += 1;
      setFeedback({ id: idRef.current, type, message: translateIfKey(message) });
    },
    [translateIfKey],
  );

  const clear = useCallback(() => {
    setFeedback(null);
  }, []);

  const systemFeedback = useMemo<SystemFeedback>(
    () => ({
      error: message => {
        show("error", message);
      },
      loading: message => {
        show("loading", message);
      },
      success: message => {
        show("success", message);
      },
      warning: message => {
        show("warning", message);
      },
      info: message => {
        show("info", message);
      },
      clear,
    }),
    [show, clear],
  );

  return (
    <SystemFeedbackContext.Provider value={systemFeedback}>
      {children}
      {feedback && (
        <Snackbar
          key={feedback.id}
          title={feedback.message}
          icon={getFeedbackIcon(feedback.type)}
          onClose={clear}
          closeIconAriaLabel={translate("Action.Close")}
          shouldAutoDismiss={feedback.type !== "loading"}
        />
      )}
    </SystemFeedbackContext.Provider>
  );
};
