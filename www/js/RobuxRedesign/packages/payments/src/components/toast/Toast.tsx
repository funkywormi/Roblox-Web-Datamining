import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Alert, type TAlertSeverity } from "@rbx/foundation-ui";

export type ToastOptions = {
  shouldAutoDismiss?: boolean;
};

type ToastMessage = {
  id: number;
  title: string;
  severity: TAlertSeverity;
  shouldAutoDismiss: boolean;
};

export type ToastService = {
  success: (title: string, options?: ToastOptions) => void;
  warning: (title: string, options?: ToastOptions) => void;
  alert: (title: string, options?: ToastOptions) => void;
  info: (title: string, options?: ToastOptions) => void;
};

type ToastContextValue = {
  toastService: ToastService;
};

export type ToastProviderProps = {
  children: ReactNode;
  closeLabel: string;
};

const AUTO_DISMISS_MS = 4000;

export const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children, closeLabel }: ToastProviderProps) => {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const idRef = useRef(0);

  const show = useCallback((variant: TAlertSeverity, title: string, options?: ToastOptions) => {
    idRef.current += 1;
    setMessage({
      id: idRef.current,
      title,
      severity: variant,
      shouldAutoDismiss: options?.shouldAutoDismiss ?? variant === "Success",
    });
  }, []);

  const toastService = useMemo<ToastService>(
    () => ({
      success: (title, options) => {
        show("Success", title, options);
      },
      warning: (title, options) => {
        show("Warning", title, options);
      },
      alert: (title, options) => {
        show("Error", title, options);
      },
      info: (title, options) => {
        show("Info", title, options);
      },
    }),
    [show],
  );

  const value = useMemo<ToastContextValue>(() => ({ toastService }), [toastService]);

  const handleClose = useCallback(() => {
    setMessage(null);
  }, []);

  useEffect(() => {
    if (!message?.shouldAutoDismiss) {
      return undefined;
    }

    const messageId = message.id;
    const timeoutId = window.setTimeout(() => {
      setMessage(current => (current?.id === messageId ? null : current));
    }, AUTO_DISMISS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [message]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div
          // The toast component has a translucent background which makes readability difficult.
          // We use a solid background color to improve readability.
          className="bg-surface-0"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "max(var(--padding-xxlarge, 32px), env(safe-area-inset-bottom))",
            transform: "translateX(-50%)",
            zIndex: "var(--foundation-portal-zindex, 9999)",
            width: "min(480px, calc(100% - 2 * var(--margin-small, 16px)))",
          }}
        >
          <Alert
            key={message.id}
            variant="Feedback"
            severity={message.severity}
            onDismiss={handleClose}
            closeLabel={closeLabel}
            hasCloseAffordance
          >
            {message.title}
          </Alert>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
