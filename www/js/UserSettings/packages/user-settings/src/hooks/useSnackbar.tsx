import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Snackbar } from "@rbx/foundation-ui";

enum SnackbarVariant {
  Success = "success",
  Warning = "warning",
}

type TSnackbarMessage = {
  id: number;
  title: string;
  variant: SnackbarVariant;
};

export type TSnackbarService = {
  success: (title: string) => void;
  warning: (title: string) => void;
};

type TSnackbarContextValue = {
  snackbarService: TSnackbarService;
};

export type TSnackbarProviderProps = {
  children: ReactNode;
  translatedCloseLabel: string;
};

const variantIcon = {
  [SnackbarVariant.Success]: "icon-regular-circle-check",
  [SnackbarVariant.Warning]: "icon-regular-triangle-exclamation",
} as const;

const SnackbarContext = createContext<TSnackbarContextValue | null>(null);

const noopSnackbarService: TSnackbarService = {
  success: () => undefined,
  warning: () => undefined,
};

export const SnackbarProvider = ({
  children,
  translatedCloseLabel,
}: TSnackbarProviderProps): React.JSX.Element => {
  const [message, setMessage] = useState<TSnackbarMessage | null>(null);
  const idRef = useRef(0);

  const show = useCallback((variant: SnackbarVariant, title: string) => {
    idRef.current += 1;
    setMessage({ id: idRef.current, title, variant });
  }, []);

  const snackbarService = useMemo<TSnackbarService>(
    () => ({
      success: title => {
        show(SnackbarVariant.Success, title);
      },
      warning: title => {
        show(SnackbarVariant.Warning, title);
      },
    }),
    [show],
  );

  const value = useMemo<TSnackbarContextValue>(() => ({ snackbarService }), [snackbarService]);

  const handleClose = useCallback(() => {
    setMessage(null);
  }, []);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {message && (
        <Snackbar
          key={message.id}
          title={message.title}
          icon={variantIcon[message.variant]}
          onClose={handleClose}
          closeIconAriaLabel={translatedCloseLabel}
          shouldAutoDismiss={message.variant === SnackbarVariant.Success}
        />
      )}
    </SnackbarContext.Provider>
  );
};

/** Returns a no-op service outside a `<SnackbarProvider>` so renders don't crash. */
export const useSnackbar = (): TSnackbarContextValue => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    return { snackbarService: noopSnackbarService };
  }
  return ctx;
};

export default useSnackbar;
