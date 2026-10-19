import clsx from 'clsx';
import React, {
  ComponentPropsWithRef,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import type { TTailwindIconClass } from '@rbx/foundation-tailwind/classes';
import { Icon } from './Icon';
import { Button } from './Button';
import { CloseAffordance } from './internal/CloseAffordance';
import { TForwardRefComponent } from './types/TForwardRefComponent';

const EXIT_DURATION_MS = 150;
const ENTER_DURATION_MS = 200;

export type TSnackbarProps = ComponentPropsWithRef<'div'> & {
  /** Primary message text displayed in the snackbar. */
  title: string;
  /** Optional icon shown alongside the title. */
  icon?: TTailwindIconClass;
  /** Label for the default action button (used when `actions` is not provided). */
  actionLabel?: string;
  /** Click handler for the default action button (used when `actions` is not provided). */
  onAction?: () => void;
  /** Custom action(s) area; overrides the default `actionLabel`/`onAction` button when provided. */
  actions?: ReactNode;
  /** Called when the snackbar is dismissed (via close button or auto-dismiss). */
  onClose?: () => void;
  /** Accessible label for the close icon button. */
  closeIconAriaLabel?: string;
  /** When true, automatically dismisses the snackbar after `autoDismissDurationMs` (or the internal default). */
  shouldAutoDismiss?: boolean;
  /** Overrides the auto-dismiss duration (in milliseconds). */
  autoDismissDurationMs?: number;
};

const SnackbarComponent = (
  {
    title,
    icon,
    actionLabel,
    onAction,
    actions,
    onClose,
    closeIconAriaLabel = 'Dismiss snackbar',
    shouldAutoDismiss,
    autoDismissDurationMs,
    className,
    ...rest
  }: TSnackbarProps,
  ref: ComponentPropsWithRef<'div'>['ref']
) => {
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('enter');
  const enterRafRef = useRef<number | undefined>(undefined);
  const autoDismissTimeoutRef = useRef<number | undefined>(undefined);
  const exitTimeoutRef = useRef<number | undefined>(undefined);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);

  const action =
    actions ??
    (actionLabel && onAction && (
      <Button
        size='Small'
        variant='Utility'
        className='content-inverse-emphasis'
        onClick={onAction}
        ref={actionButtonRef}>
        {actionLabel}
      </Button>
    ));

  const hasAction = Boolean(action);
  const isLongTitle = title.length > 80;
  const computedShouldAutoDismiss = shouldAutoDismiss ?? true;
  let defaultAutoDismissDuration = 4000;
  if (hasAction) {
    defaultAutoDismissDuration = isLongTitle ? 10000 : 7000;
  }
  const computedAutoDismissDuration = autoDismissDurationMs ?? defaultAutoDismissDuration;

  const requestClose = useCallback(() => {
    if (phase === 'exit') return;
    setPhase('exit');
    if (autoDismissTimeoutRef.current !== undefined) {
      window.clearTimeout(autoDismissTimeoutRef.current);
      autoDismissTimeoutRef.current = undefined;
    }
    exitTimeoutRef.current = window.setTimeout(() => {
      onClose?.();
    }, EXIT_DURATION_MS);
  }, [onClose, phase]);

  useEffect(() => {
    enterRafRef.current = window.requestAnimationFrame(() => {
      setPhase('idle');
    });
    return () => {
      if (enterRafRef.current !== undefined) {
        window.cancelAnimationFrame(enterRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoDismissTimeoutRef.current !== undefined) {
      window.clearTimeout(autoDismissTimeoutRef.current);
      autoDismissTimeoutRef.current = undefined;
    }
    if (!computedShouldAutoDismiss || phase === 'exit') return;
    autoDismissTimeoutRef.current = window.setTimeout(() => {
      requestClose();
    }, computedAutoDismissDuration);
  }, [computedAutoDismissDuration, computedShouldAutoDismiss, phase, requestClose]);

  useEffect(() => {
    if (hasAction) {
      actionButtonRef.current?.focus();
    }
  }, [hasAction]);

  useEffect(
    () => () => {
      if (autoDismissTimeoutRef.current !== undefined) {
        window.clearTimeout(autoDismissTimeoutRef.current);
      }
      if (exitTimeoutRef.current !== undefined) {
        window.clearTimeout(exitTimeoutRef.current);
      }
      if (enterRafRef.current !== undefined) {
        window.cancelAnimationFrame(enterRafRef.current);
      }
    },
    []
  );

  const translateY = phase === 'idle' ? '0' : '120%';

  const floatingStyle = {
    position: 'fixed' as const,
    left: '50%',
    bottom: 'max(var(--padding-xxlarge, 32px), env(safe-area-inset-bottom))',
    transform: `translate(-50%, ${translateY})`,
    zIndex: 'var(--foundation-portal-zindex, 9999)'
  };

  const mergedStyle = rest.style ? { ...floatingStyle, ...rest.style } : floatingStyle;

  return (
    <div
      ref={ref}
      role='status'
      aria-live='polite'
      className={clsx(
        'flex items-center gap-xxlarge radius-medium shadow-transient-low bg-inverse-surface-0 padding-x-medium padding-y-medium stroke-standard shrink-0',
        'max-width-[480px] min-height-[48px]',
        // min width is either 393, screen-width - max(margin, safe-area-inset)
        'min-width-[min(100%-max(2_*_var(--margin-small),env(safe-area-inset-left)+env(safe-area-inset-right)),393px)]',
        'foundation-web-portal-zindex pointer-events-auto',
        phase === 'exit' ? 'ease-standard-in' : 'ease-standard-out',
        className
      )}
      style={{
        ...mergedStyle,
        transitionDuration: `${phase === 'exit' ? EXIT_DURATION_MS : ENTER_DURATION_MS}ms`,
        transitionProperty: 'transform'
      }}
      {...rest}>
      <div className='flex items-center gap-medium grow-1 basis-0 min-h-[40px]'>
        {icon && <Icon name={icon} size='Small' className='shrink-0 content-inverse-emphasis' />}
        <div className='grow-1 basis-0 text-caption-large content-inverse-emphasis text-truncate-end'>
          {title}
        </div>
      </div>
      <div className='flex items-center justify-end gap-small shrink-0'>
        {action}
        {onClose && (
          <CloseAffordance
            variant='Utility'
            size='Small'
            isCircular
            className='content-inverse-emphasis'
            aria-label={closeIconAriaLabel}
            onClick={requestClose}
          />
        )}
      </div>
    </div>
  );
};

export const Snackbar = forwardRef(SnackbarComponent) as TForwardRefComponent<TSnackbarProps>;
