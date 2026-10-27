import React from 'react';
import classNames from 'classnames';
import { Dialog, DialogContent } from '@rbx/foundation-ui';

// react-style-guide's Modal, Button and Loading with the same DOM, since its barrel does not build on Next.js.

export type IModalService = {
  open: () => void;
  close: (closedByAction?: boolean) => void;
};

const SIZE_MAP = { sm: 'Medium', md: 'Medium', lg: 'Large' } as const;

type TPreventable = { preventDefault: () => void };

// Foundation forwards these to the Radix content but leaves them out of TDialogContentProps.
const RadixDialogContent = DialogContent as React.ComponentType<
  React.ComponentProps<typeof DialogContent> & {
    onPointerDownOutside?: (event: TPreventable) => void;
    onInteractOutside?: (event: TPreventable) => void;
    onEscapeKeyDown?: (event: TPreventable) => void;
  }
>;

type TModalProps = {
  show?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onHide?: () => void;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  className?: string;
  centered?: boolean | string;
  scrollable?: boolean | string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;
};

type TDivProps = React.HTMLAttributes<HTMLDivElement>;

const ModalHeader = ({
  useBaseBootstrapComponent: _,
  className,
  ...props
}: TDivProps & { useBaseBootstrapComponent?: boolean }): React.JSX.Element => (
  <div {...props} className={classNames(className, 'modal-header')} />
);

const ModalTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element => (
  <h4 {...props} className={classNames(className, 'modal-title')}>
    {children}
  </h4>
);

const ModalBody = ({ className, ...props }: TDivProps): React.JSX.Element => (
  <div {...props} className={classNames(className, 'modal-body')} />
);

const ModalFooter = ({ className, ...props }: TDivProps): React.JSX.Element => (
  <div {...props} className={classNames(className, 'modal-footer')} />
);

const ModalRoot = ({
  show = false,
  size,
  onHide,
  backdrop = true,
  keyboard = true,
  className,
  'aria-labelledby': ariaLabelledBy,
  children
}: TModalProps): React.JSX.Element => {
  const isStaticBackdrop = backdrop === 'static';
  return (
    <Dialog
      open={show}
      onOpenChange={open => {
        if (!open) {
          onHide?.();
        }
      }}
      size={size ? SIZE_MAP[size] : 'Medium'}
      isModal={backdrop !== false}
      hasCloseAffordance={false}
      closeLabel=''
      aria-labelledby={ariaLabelledBy}
      experimentalDisablePointerEventsStylingOnBody>
      <RadixDialogContent
        overlayClassName={className}
        style={{ background: 'none', border: 'none' }}
        className='modal-dialog'
        onPointerDownOutside={isStaticBackdrop ? e => e.preventDefault() : undefined}
        onInteractOutside={isStaticBackdrop ? e => e.preventDefault() : undefined}
        onEscapeKeyDown={keyboard ? undefined : e => e.preventDefault()}>
        <div className='modal-content'>{children}</div>
      </RadixDialogContent>
    </Dialog>
  );
};

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter
});

const BUTTON_VARIANTS = {
  primary: 'primary',
  secondary: 'secondary',
  control: 'control',
  cta: 'cta',
  alert: 'alert',
  growth: 'growth'
} as const;
const BUTTON_SIZES = { large: 'lg', medium: 'md', small: 'sm', extraSmall: 'xs' } as const;
const BUTTON_WIDTHS = { min: 'min', full: 'full' } as const;

type TButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
  variant?: (typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];
  size?: (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];
  width?: (typeof BUTTON_WIDTHS)[keyof typeof BUTTON_WIDTHS];
  isDisabled?: boolean;
  isLoading?: boolean;
};

const ButtonRoot = ({
  className,
  variant = 'primary',
  size = 'md',
  width = 'min',
  isDisabled = false,
  isLoading = false,
  children,
  ...props
}: TButtonProps): React.JSX.Element => (
  <button
    type='button'
    className={classNames(className, `btn-${variant}-${size}`, `btn-${width}-width`)}
    disabled={isDisabled || isLoading}
    {...props}>
    {children}
  </button>
);

export const Button = Object.assign(ButtonRoot, {
  variants: BUTTON_VARIANTS,
  sizes: BUTTON_SIZES,
  widths: BUTTON_WIDTHS
});

export const Loading = ({ className }: { className?: string }): React.JSX.Element => (
  <span className={classNames('spinner spinner-default', className)} />
);
