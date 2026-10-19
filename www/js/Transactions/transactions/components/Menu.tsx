import clsx from 'clsx';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { Slot } from '@radix-ui/react-slot';
import * as RadixSelect from '@radix-ui/react-select';
import * as RovingFocusGroup from '@radix-ui/react-roving-focus';
import type {
  TTailwindGapXClass,
  TTailwindGapYClass,
  TTailwindPaddingClass,
  TTailwindPaddingXClass,
  TTailwindPaddingYClass,
  TTailwindRadiusClass,
  TTailwindTextBodyClass
} from '@rbx/foundation-tailwind/classes';
import { DropdownContext } from './Dropdown';
import { interactable, StateLayer } from './internal/StateLayer';
import { disabledOpacity } from '../utils/styles';

export const menuSizes = ['XSmall', 'Small', 'Medium', 'Large'] as const;
export type TMenuSize = (typeof menuSizes)[number];

const RADIUS_CLASS_BY_SIZE: Record<TMenuSize, TTailwindRadiusClass> = {
  XSmall: 'radius-medium',
  Small: 'radius-large',
  Medium: 'radius-large',
  Large: 'radius-large'
};

const SECTION_PADDING_CLASS_BY_SIZE: Record<TMenuSize, TTailwindPaddingClass> = {
  XSmall: 'padding-xsmall',
  Small: 'padding-small',
  Medium: 'padding-small',
  Large: 'padding-small'
};

const PADDING_X_CLASS_BY_SIZE: Record<TMenuSize, TTailwindPaddingXClass> = {
  XSmall: 'padding-x-medium',
  Small: 'padding-x-medium',
  Medium: 'padding-x-medium',
  Large: 'padding-x-large'
};

const MENU_ITEM_PADDING_Y_CLASS_BY_SIZE: Record<TMenuSize, TTailwindPaddingYClass> = {
  XSmall: 'padding-y-xsmall',
  Small: 'padding-y-small',
  Medium: 'padding-y-small',
  Large: 'padding-y-medium'
};

const MENU_ITEM_GAP_X_CLASS_BY_SIZE: Record<TMenuSize, TTailwindGapXClass> = {
  XSmall: 'gap-x-medium',
  Small: 'gap-x-medium',
  Medium: 'gap-x-medium',
  Large: 'gap-x-large'
};

const MENU_ITEM_GAP_Y_CLASS_BY_SIZE: Record<TMenuSize, TTailwindGapYClass> = {
  XSmall: 'gap-y-xxsmall',
  Small: 'gap-y-xxsmall',
  Medium: 'gap-y-xsmall',
  Large: 'gap-y-xsmall'
};

const TEXT_CLASS_BY_SIZE: Record<TMenuSize, TTailwindTextBodyClass> = {
  XSmall: 'text-body-small',
  Small: 'text-body-small',
  Medium: 'text-body-medium',
  Large: 'text-body-large'
};

const MENU_ITEM_RADIUS_CLASS_BY_SIZE: Record<TMenuSize, TTailwindRadiusClass> = {
  XSmall: 'radius-small',
  Small: 'radius-medium',
  Medium: 'radius-medium',
  Large: 'radius-medium'
};

type TMenuMode =
  // Menu is rendered inside a Dropdown.
  | 'dropdown'
  // Menu is rendered as a standalone component.
  | 'standalone';

type TMenuContext = {
  size: TMenuSize;
  mode: TMenuMode;
};

const MenuContext = createContext<TMenuContext | null>(null);

const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu components must be used within a Menu');
  }
  return context;
};

export type TMenuProps = {
  children: ReactNode;
  className?: string;
  size?: TMenuSize;
};

export const Menu = ({ children, className, size: sizeProp }: TMenuProps) => {
  const dropdownContext = useContext(DropdownContext);
  const mode: TMenuMode = dropdownContext ? 'dropdown' : 'standalone';
  const size = sizeProp ?? dropdownContext?.size ?? 'Medium';

  const contextValue = useMemo(() => ({ size, mode }), [size, mode]);

  const menuClassName = clsx(
    'foundation-web-menu bg-surface-100 stroke-standard stroke-default shadow-transient-high',
    RADIUS_CLASS_BY_SIZE[size],
    className
  );

  const content =
    mode === 'standalone' ? (
      <RovingFocusGroup.Root asChild orientation='vertical' loop>
        <div role='menu' tabIndex={-1} className={menuClassName}>
          {children}
        </div>
      </RovingFocusGroup.Root>
    ) : (
      <div className={menuClassName}>{children}</div>
    );

  return (
    <MenuContext.Provider value={contextValue}>
      {mode === 'dropdown' ? (
        <RadixSelect.Viewport asChild style={{ width: 'var(--radix-popper-anchor-width)' }}>
          {content}
        </RadixSelect.Viewport>
      ) : (
        content
      )}
    </MenuContext.Provider>
  );
};

export type TMenuSectionProps = {
  children:
    | React.ReactElement<TMenuItemProps>
    | (React.ReactElement<TMenuItemProps> | false | null | undefined)[]; // Allow conditional rendering of menu items
  className?: string;
};

export const MenuSection = ({ children, className }: TMenuSectionProps) => {
  const { size } = useMenuContext();
  return (
    <div role='group' className={clsx(SECTION_PADDING_CLASS_BY_SIZE[size], className)}>
      {children}
    </div>
  );
};

export type TMenuSeparatorProps = {
  className?: string;
};

export const MenuSeparator = ({ className }: TMenuSeparatorProps) => {
  return <div role='separator' className={clsx('foundation-web-menu-separator', className)} />;
};

export type TMenuLabelProps = {
  title: string;
  description?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /**
   * This is a visual class only to match MenuItem and does not have any use in functionality or accessibility.
   */
  disabled?: boolean;
  className?: string;
};

export const MenuLabel = ({
  title,
  description,
  leading,
  trailing,
  disabled,
  className
}: TMenuLabelProps) => {
  const { size } = useMenuContext();

  const labelClassName = clsx(
    'foundation-web-menu-label flex items-center content-default text-truncate-split text-align-x-left width-full',
    TEXT_CLASS_BY_SIZE[size],
    PADDING_X_CLASS_BY_SIZE[size],
    MENU_ITEM_PADDING_Y_CLASS_BY_SIZE[size],
    MENU_ITEM_GAP_X_CLASS_BY_SIZE[size],
    disabled && disabledOpacity,
    className
  );

  return (
    <div role='none' className={labelClassName}>
      {leading}
      <div
        className={clsx(
          'grow-1 text-truncate-split flex flex-col',
          MENU_ITEM_GAP_Y_CLASS_BY_SIZE[size]
        )}>
        <span className='foundation-web-menu-label-title text-no-wrap text-truncate-split content-emphasis'>
          {title}
        </span>
        {description && (
          <div className='foundation-web-menu-label-description content-muted'>{description}</div>
        )}
      </div>
      {trailing}
    </div>
  );
};

type TMenuItemCoreProps = {
  value: string;
  leading?: ReactNode;
  disabled?: boolean;
  title?: string;
  description?: string;
  trailing?: ReactNode;
  className?: string;
  onSelect?: () => void;
};

type TMenuItemAsChildProps<T extends 'button' | 'a'> =
  | {
      /**
       * Use the provided child element as the default rendered element, combining their props and behavior.
       *
       * Note if title is provided, the children of the child element will be replaced with the menu item content.
       * It is recommended to use the title prop when possible to guarantee design consistency.
       */
      asChild: true;
      title?: string;
      children: ReactNode;
      as?: never;
    }
  | {
      asChild?: never;
      title: string;
      children?: never;
      as?: T;
    };

/**
 * Since ElementType can have overlap with our custom props,
 * we need to omit constraints on fields we define from the final props type.
 */
type TMenuItemVariantProps<T extends 'button' | 'a'> = Omit<
  React.ComponentPropsWithoutRef<T>,
  keyof TMenuItemCoreProps
> &
  TMenuItemCoreProps &
  TMenuItemAsChildProps<T>;

export type TMenuItemProps =
  | (TMenuItemVariantProps<'button'> & {
      /** Defines the component HTML tag to render. @default button */
      as?: 'button';
    })
  | (TMenuItemVariantProps<'a'> & {
      /** Defines the component HTML tag to render. */
      as: 'a';
    });

export const MenuItem = ({
  value,
  leading,
  title,
  description,
  trailing,
  disabled,
  className,
  onSelect,
  asChild,
  children,
  ...props
}: TMenuItemProps) => {
  const { size, mode } = useMenuContext();

  const itemClassName = clsx(
    interactable,
    'foundation-web-menu-item flex items-center content-default text-truncate-split focus-visible:hover:outline-none cursor-pointer stroke-none bg-none text-align-x-left width-full',
    TEXT_CLASS_BY_SIZE[size],
    PADDING_X_CLASS_BY_SIZE[size],
    MENU_ITEM_PADDING_Y_CLASS_BY_SIZE[size],
    MENU_ITEM_GAP_X_CLASS_BY_SIZE[size],
    MENU_ITEM_RADIUS_CLASS_BY_SIZE[size],
    disabled && disabledOpacity,
    disabled && 'pointer-events-none',
    className
  );

  let titleEl = (
    <span className='foundation-web-menu-item-title text-no-wrap text-truncate-split content-emphasis'>
      {title}
    </span>
  );
  switch (mode) {
    case 'dropdown':
      titleEl = <RadixSelect.ItemText asChild>{titleEl}</RadixSelect.ItemText>;
      break;
    case 'standalone':
      // no-op.
      break;
    default: {
      const exhaustiveCheck: never = mode;
      // eslint-disable-next-line no-console
      console.error('Invalid menu mode:', exhaustiveCheck);
    }
  }

  const itemChildren = (
    <React.Fragment>
      {!disabled && <StateLayer />}
      {leading}
      <div
        className={clsx(
          'grow-1 text-truncate-split flex flex-col',
          MENU_ITEM_GAP_Y_CLASS_BY_SIZE[size]
        )}>
        {titleEl}
        {description && (
          <div className='foundation-web-menu-item-description content-muted'>{description}</div>
        )}
      </div>
      {trailing}
    </React.Fragment>
  );

  let element: React.ReactElement;

  if (asChild) {
    const { as: _, ...restProps } = props;
    const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
    // Override children with menu item content if title is provided.
    const shouldRenderProvidedChildren = title === undefined && child.props.children;
    element = (
      <Slot
        {...restProps}
        role={mode === 'standalone' ? 'menuitem' : undefined}
        aria-disabled={disabled || undefined}
        className={itemClassName}
        style={{ outlineOffset: 0 }}
        onClick={disabled ? undefined : onSelect}>
        {shouldRenderProvidedChildren
          ? React.cloneElement(
              child,
              {},
              // It is necessary to include the StateLayer to keep interactivity styling
              <React.Fragment>
                {!disabled && <StateLayer />}
                {child.props.children as ReactNode}
              </React.Fragment>
            )
          : React.cloneElement(child, {}, itemChildren)}
      </Slot>
    );
  } else if (props.as === 'a') {
    const { as: _, href, ...restProps } = props;
    element = (
      <a
        {...restProps}
        role={mode === 'standalone' ? 'menuitem' : undefined}
        aria-disabled={disabled}
        href={disabled ? undefined : href}
        className={itemClassName}
        style={{ outlineOffset: 0, textDecoration: 'none' }}
        onClick={disabled ? undefined : onSelect}>
        {itemChildren}
      </a>
    );
  } else {
    const { as: _, ...restProps } = props;
    element = (
      <button
        type='button'
        {...restProps}
        role={mode === 'standalone' ? 'menuitem' : undefined}
        aria-disabled={disabled}
        className={itemClassName}
        style={{ outlineOffset: 0 }}
        onClick={disabled ? undefined : onSelect}>
        {itemChildren}
      </button>
    );
  }

  if (mode === 'dropdown') {
    return (
      <RadixSelect.Item value={value} disabled={disabled} asChild>
        {element}
      </RadixSelect.Item>
    );
  }

  return (
    <RovingFocusGroup.Item asChild focusable tabStopId={value}>
      {element}
    </RovingFocusGroup.Item>
  );
};
