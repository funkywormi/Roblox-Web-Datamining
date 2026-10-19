import clsx from 'clsx';
import React, {
  ComponentProps,
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useMemo
} from 'react';
import type {
  TTailwindClass,
  TTailwindTextBodyClass,
  TTailwindTextTitleClass
} from '@rbx/foundation-tailwind/classes';
import { interactable, StateLayer } from './internal/StateLayer';
import './ListItem.css';
import { TForwardRefComponent } from './types/TForwardRefComponent';

export const listItemDividers = ['None', 'Full', 'Inset'] as const;
export type TListItemDivider = (typeof listItemDividers)[number];

/**
 * The size of the list item.
 *
 * Small and XSmall are pretty much identical. Currently, the Figma only shows a
 * a differences for certain accessories, such as the Chevron icon. Other accessories
 * such as the Radio icon there is no difference between Small and XSmall.
 */
export type TListItemSize = 'Large' | 'Medium' | 'Small' | 'XSmall';
export type TListItemAlignment = 'Top' | 'Middle';

type TListItemProviderContext = {
  size: TListItemSize;
};

const ListItemContext = createContext<TListItemProviderContext | null>(null);

export const useListItemProvider = () => {
  const context = useContext(ListItemContext);
  if (!context) {
    throw new Error('useListItemProvider must be used within a ListItem');
  }
  return context;
};

const BODY_CLASS_BY_SIZE: Record<TListItemSize, TTailwindTextBodyClass> = {
  XSmall: 'text-body-small',
  Small: 'text-body-small',
  Medium: 'text-body-medium',
  Large: 'text-body-medium'
};

const TITLE_BOLD_CLASS_BY_SIZE: Record<TListItemSize, TTailwindTextTitleClass> = {
  XSmall: 'text-title-small',
  Small: 'text-title-small',
  Medium: 'text-title-medium',
  Large: 'text-title-large'
};

const TITLE_PLAIN_CLASS_BY_SIZE: Record<TListItemSize, TTailwindClass> = {
  XSmall: 'text-body-small',
  Small: 'text-body-small',
  Medium: 'text-body-medium',
  Large: 'text-body-large'
};

export type TListItemProps = {
  /**
   * When true, use a smaller horizontal padding as the container should already
   * have horizonal margin / padding to compensate.
   * See example here: https://www.figma.com/design/vy6X3AU6LqxIhdQGoMPOh7/Foundation-Design-Kit?node-id=34926-7181
   */
  isContained: boolean;

  /**
   * Defaults to 'Large'.
   */
  size?: TListItemSize;

  /**
   * Determines how to display the divider.
   */
  divider: TListItemDivider;

  /**
   * Vertical alignment for leading/trailing accessories.
   * Defaults to 'Middle'.
   */
  alignment?: TListItemAlignment;

  /**
   * The text to display above text.
   */
  title?: string;

  /**
   * Whether the title should be bold.
   * Defaults to true.
   */
  isTitleBold?: boolean;

  /**
   * The text to display below title.
   */
  /** @deprecated Use `metadata` for a single line or `description` for multiline. */
  text?: string;

  /**
   * Whether the text is expected to be multiline.
   */
  /** @deprecated Use `description` for multiline content. */
  isMultiline?: boolean;

  /**
   * Single line of text below the title.
   */
  metadata?: string;

  /**
   * One or more lines of text below the metadata/title.
   */
  description?: string;

  /**
   * The leading content to display on the left side.
   */
  leading?: ReactNode;

  /**
   * The trailing content to display on the right side.
   */
  trailing?: ReactNode;

  /**
   * If provided, the list item will become a button and will be clickable.
   */
  onSelect?: () => void;

  className?: string;
};

/**
 * A list item is a single item in a list.
 *
 * See <a href="https://www.figma.com/design/vy6X3AU6LqxIhdQGoMPOh7/Foundation-Design-Kit?node-id=34926-7506" target="_blank">Figma</a> and
 * <a href="https://roblox.atlassian.net/wiki/spaces/foundation/pages/4028236341/List+ListItem">Wiki</a> for more information.
 *
 * Also see `List` for a container component.
 *
 * For leading accessories, see `ListItemLeadingAccessorySpacer` and `ListItemLeadingIcon`. Leading accessories should have
 * a special width based on the ListItem size (see `ListItemLeadingAccessorySpacer`)
 * For trailing accessories, see `ListItemTrailingIcon`, `ListItemRadioAccessory` and `ListItemChevronTrailingAccessory`.
 * Both leading and trailing icons have specific sizes based on the ListItem size.
 *
 * Note (2026-01-23): `text` and `isMultiline` are deprecated. Use `metadata` and `description` instead.
 */
export const ListItem = forwardRef<HTMLLIElement, TListItemProps>(
  (
    {
      isContained,
      size,
      divider,
      alignment,
      title,
      isTitleBold = true,
      text,
      isMultiline,
      metadata,
      description,
      leading,
      trailing,
      onSelect,
      className
    }: TListItemProps,
    ref
  ) => {
    /**
     * Legacy mode means `text` (and `isMultiline`) are used. These are deprecated.
     * Use `metadata` and `description` instead.
     * To avoid bugs, we'll throw an error if both legacy and new props are mixed.
     */
    const isLegacyMode =
      metadata === undefined &&
      description === undefined &&
      alignment === undefined &&
      size === undefined;
    if ((text !== undefined || isMultiline !== undefined) && !isLegacyMode) {
      throw new Error(
        'ListItem: Cannot use deprecated "text" or "isMultiline" props with "metadata", "description", "alignment", or "size".'
      );
    }

    const resolvedSize = size ?? 'Large';
    const isButton = onSelect !== undefined;
    const Component = isButton ? 'button' : 'div';
    const isLegacyMultiline = isLegacyMode ? isMultiline : false;
    let accessoryAlignmentClass = alignment === 'Top' ? 'justify-start' : 'justify-center';
    if (isLegacyMultiline) {
      accessoryAlignmentClass = 'justify-start';
    }
    const buttonEl = (
      <Component
        className={clsx(
          'bg-none width-full flex gap-medium stroke-none foundation-web-list-item padding-y-none',
          isContained ? 'padding-x-medium' : 'padding-x-xlarge',
          divider === 'Full' && 'foundation-web-list-item-bottom-divider',
          isButton && interactable,
          isButton && 'cursor-pointer',
          className
        )}
        {...(isButton && { onClick: () => onSelect() })}>
        {isButton && <StateLayer />}
        {leading && (
          <div className={clsx('flex flex-col padding-y-large', accessoryAlignmentClass)}>
            {leading}
          </div>
        )}
        <div className='flex fill clip-x padding-y-large gap-x-medium relative '>
          <div
            className={clsx(
              'flex flex-col fill clip-x justify-center',
              isLegacyMultiline && 'gap-xsmall'
            )}>
            {title && (
              <div
                className={clsx(
                  'content-emphasis text-align-x-start',
                  isTitleBold
                    ? TITLE_BOLD_CLASS_BY_SIZE[resolvedSize]
                    : TITLE_PLAIN_CLASS_BY_SIZE[resolvedSize]
                )}>
                {title}
              </div>
            )}
            {isLegacyMode && text && (
              <div
                className={clsx(
                  'content-default text-align-x-start',
                  BODY_CLASS_BY_SIZE[resolvedSize],
                  !isMultiline && 'text-truncate-split text-no-wrap'
                )}>
                {text}
              </div>
            )}
            {!isLegacyMode && metadata && (
              <div
                className={clsx(
                  'content-default text-align-x-start text-truncate-split text-no-wrap',
                  BODY_CLASS_BY_SIZE[resolvedSize]
                )}>
                {metadata}
              </div>
            )}
            {!isLegacyMode && description && (
              <div
                className={clsx(
                  'content-default text-align-x-start padding-top-xsmall',
                  BODY_CLASS_BY_SIZE[resolvedSize]
                )}>
                {description}
              </div>
            )}
          </div>
          {trailing && (
            <div className={clsx('flex flex-col', accessoryAlignmentClass)}>{trailing}</div>
          )}
          {divider === 'Inset' && <div className='foundation-web-list-item-inset-divider' />}
        </div>
      </Component>
    );

    const contextValue = useMemo(() => ({ size: resolvedSize }), [resolvedSize]);
    return (
      <li ref={ref} style={{ listStyle: 'none' }}>
        <ListItemContext.Provider value={contextValue}>{buttonEl}</ListItemContext.Provider>
      </li>
    );
  }
) as TForwardRefComponent<TListItemProps>;

ListItem.displayName = 'ListItem';

export type TListProps = {
  /**
   * The HTML element to render as. Defaults to 'ul'.
   */
  as?: 'ul' | 'ol';
} & (ComponentProps<'ul'> | ComponentProps<'ol'>);

export const List = forwardRef<HTMLUListElement | HTMLOListElement, TListProps>(
  ({ children, className, as = 'ul', ...restProps }, ref) => {
    return React.createElement(
      as,
      {
        ref,
        className: clsx('foundation-web-list', className),
        ...restProps
      },
      children
    );
  }
) as TForwardRefComponent<TListProps>;

List.displayName = 'List';
