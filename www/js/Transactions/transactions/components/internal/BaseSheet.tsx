import React, { ComponentProps, ReactNode } from 'react';
import clsx from 'clsx';
import * as RadixDialog from '@radix-ui/react-dialog';
import './BaseSheet.css';
import './Common.css';

export type TBaseSheetType = 'bottomSheet' | 'sideSheet' | 'centerSheet';
export type TBaseSheetSide = 'left' | 'right';
export type TBaseSheetSize = 'Medium' | 'Large';

type TRadixDialogContentProps = ComponentProps<typeof RadixDialog.Content>;

type TBaseSheetContentProps = {
  /**
   * The type of sheet to render.
   */
  type: TBaseSheetType;

  /**
   * Which side to attach the sheet to. Required when type is 'sideSheet'.
   */
  sideSheetSide?: TBaseSheetSide;

  /**
   * Whether the side sheet should be flush (no margins). Only applies to sideSheet type.
   */
  isSideSheetFlush?: boolean;

  /**
   * The size of the center sheet. Only applies to centerSheet type.
   */
  centerSheetSize?: TBaseSheetSize;

  /**
   * The content to render inside the sheet.
   */
  children: ReactNode;

  /**
   * Optional className for the overlay.
   */
  overlayClassName?: string;

  /**
   * Optional className for the content.
   */
  contentClassName?: string;

  /**
   * Event handler called when focus moves into the component after opening.
   * It can be prevented by calling `event.preventDefault`.
   */
  onOpenAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when focus moves to the trigger after closing.
   * It can be prevented by calling `event.preventDefault`.
   */
  onCloseAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when a pointer down event occurs outside the bounds
   * of the component. Call `event.preventDefault()` to stop the sheet from
   * closing in response to outside pointer interactions.
   */
  onPointerDownOutside?: TRadixDialogContentProps['onPointerDownOutside'];

  /**
   * Event handler called when the Escape key is pressed. Call
   * `event.preventDefault()` to stop the sheet from closing on Escape.
   */
  onEscapeKeyDown?: TRadixDialogContentProps['onEscapeKeyDown'];

  /**
   * Event handler called when an interaction (pointer down or focus) occurs
   * outside the bounds of the component. Call `event.preventDefault()` to
   * stop the sheet from closing in response to outside interactions.
   */
  onInteractOutside?: TRadixDialogContentProps['onInteractOutside'];
};

/**
 * BaseSheetContent is an internal component that renders sheet content with configurable positioning.
 * It uses data attributes for styling instead of media queries, allowing for programmatic control.
 *
 * The parent component can use `useMediaQuery` to determine the appropriate sheet variant.
 *
 * This component is used internally by SheetContent and will be used by Drawer in the future.
 * It renders Portal → Overlay → Content. The parent must wrap this in a RadixDialog.Root.
 */
export const BaseSheetContent = ({
  type,
  sideSheetSide = 'right',
  isSideSheetFlush = false,
  centerSheetSize = 'Medium',
  children,
  overlayClassName,
  contentClassName,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerDownOutside,
  onEscapeKeyDown,
  onInteractOutside
}: TBaseSheetContentProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        data-testid='fui-base-sheet-overlay'
        data-type={type}
        data-side={type === 'sideSheet' ? sideSheetSide : undefined}
        data-flush={type === 'sideSheet' ? isSideSheetFlush : undefined}
        data-size={type === 'centerSheet' ? centerSheetSize : undefined}
        className={clsx(
          'fui-base-sheet-overlay',
          'foundation-web-portal-zindex fixed inset-[0] flex',
          overlayClassName
        )}>
        <RadixDialog.Content
          data-testid='fui-base-sheet-content'
          className={clsx(
            'fui-base-sheet-content relative bg-surface-100 stroke-muted stroke-standard shadow-transient-high',
            'flex flex-col clip',
            contentClassName
          )}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
          onPointerDownOutside={onPointerDownOutside}
          onEscapeKeyDown={onEscapeKeyDown}
          onInteractOutside={onInteractOutside}>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Portal>
  );
};
