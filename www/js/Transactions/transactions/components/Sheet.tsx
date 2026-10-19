import clsx from 'clsx';
import * as RadixDialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import React, {
  ComponentProps,
  ReactNode,
  createContext,
  useContext,
  useMemo,
  forwardRef
} from 'react';
import { useMediaQuery } from 'usehooks-ts';
import type { TTailwindPaddingXClass } from '@rbx/foundation-tailwind/classes';
import './internal/Common.css';
import { IconButton } from './IconButton';
import { Divider } from './Divider';
import { BaseSheetContent, TBaseSheetType } from './internal/BaseSheet';
import './internal/BaseSheet.css';
import dialogAutoFocusByPriority from '../utils/dialogAutoFocusByPriority';
import { TForwardRefComponent } from './types/TForwardRefComponent';

export { dialogAutoFocusByPriority };

export type TSheetCenteredSize = 'Medium' | 'Large';
export type TSheetLargeScreenVariant = 'center' | 'side';

const SheetContext = createContext<{
  centerSheetSize: TSheetCenteredSize;
  largeScreenVariant: TSheetLargeScreenVariant;
  closeLabel?: string;
  isPortraitMobile: boolean;
  isLandscapeMobile: boolean;
  type: TBaseSheetType;
} | null>(null);

const useSheetContext = () => {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('Sheet components must be used within a Sheet');
  }
  return context;
};

export type TSheetRootProps = {
  /**
   * The controlled open state of the sheet. Must be used in conjunction with onOpenChange.
   */
  open?: boolean;

  /**
   * Event handler called when the open state of the sheet changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Instead of providing `open` and `onOpenChange`, you can provide `defaultOpen` to make the sheet uncontrolled.
   */
  defaultOpen?: boolean;

  children?: ReactNode;
};

const PADDING_X_CLASS: TTailwindPaddingXClass = 'padding-x-xlarge';

/**
 * Foundation UI Sheet Root Component.
 *
 * Sheet is an adaptive overlay component that automatically adjusts its presentation
 * based on screen size and orientation:
 *
 * - **Mobile Portrait** (width ≤600px): Bottom sheet that slides up from the bottom
 * - **Mobile Landscape** (height ≤600px): Side sheet that slides in from the right
 * - **Desktop**: Configurable via `largeScreenVariant` prop on SheetContent - either
 *   centered like a dialog or attached to the right side
 *
 * Use Sheet for forms, confirmations, navigation menus, or any content that needs
 * temporary focus without leaving the current page.
 *
 * ## Component Structure
 *
 * Sheet uses a compositional API:
 * ```
 * SheetRoot              // Controls open state (this component)
 * ├── SheetTrigger      // Optional: Button to open the sheet
 * └── SheetContent      // Container with configuration props
 *     ├── SheetTitle    // Required: Header with optional navigation/utilities
 *     ├── SheetBody     // Main scrollable content area
 *     └── SheetActions  // Optional: Bottom action buttons
 * ```
 *
 * ## Example Usage
 *
 * ```tsx
 * import { useState } from 'react';
 * import {
 *   SheetRoot,
 *   SheetContent,
 *   SheetTitle,
 *   SheetBody,
 *   SheetActions,
 *   SheetTrigger
 * } from '@rbx/foundation-ui';
 *
 * function MyComponent() {
 *   const [open, setOpen] = useState(false);
 *
 *   return (
 *     <SheetRoot open={open} onOpenChange={setOpen}>
 *       <SheetTrigger>
 *         <Button>Open Sheet</Button>
 *       </SheetTrigger>
 *
 *       <SheetContent
 *         centerSheetSize='Medium'
 *         largeScreenVariant='center'
 *         closeLabel='Close'>
 *         <SheetTitle>Edit Profile</SheetTitle>
 *
 *         <SheetBody>
 *           <SheetDescription>
 *             <p>Update your profile information below.</p>
 *           </SheetDescription>
 *           ....
 *           <TextInput label='Name' data-autofocus-priority='1' />
 *           <TextInput label='Email' />
 *           ....
 *         </SheetBody>
 *
 *         <SheetActions>
 *           <Button variant='Emphasis'>
 *             Save
 *           </Button>
 *           <Button variant='Standard'>
 *             Cancel
 *           </Button>
 *         </SheetActions>
 *       </SheetContent>
 *     </SheetRoot>
 *   );
 * }
 * ```
 *
 * ## Known Limitations
 *
 * Current deviations from the design spec:
 * - Bottom sheet style does not support drag handle or drag-to-resize (no plans to implement atm)
 *
 *
 * ## Auto-Focus Behavior
 *
 * Sheet includes basic auto-focus using a priority system. Elements with
 * `data-autofocus-priority` attributes are considered, with lower numbers receiving
 * focus first.
 *
 * **Priority Suggestions:**
 * - **Form sheets**: Priority on the first input field to let users start typing immediately
 * - **Confirmation**: Priority on the least-destructive action
 *
 * **Priority System Example:**
 *
 * ```tsx
 * <SheetContent>
 *   <SheetTitle>Contact Form</SheetTitle>
 *   <SheetBody>
 *     <TextInput label='Name' data-autofocus-priority='1' />      // Focused first
 *     <TextInput label='Email' data-autofocus-priority='2' />     // Fallback
 *     <TextInput label='Phone' />                                 // No auto-focus
 *   </SheetBody>
 *   <SheetActions>
 *     <Button variant='Emphasis' data-autofocus-priority='10'>Submit</Button>
 *   </SheetActions>
 * </SheetContent>
 * ```
 *
 * **Built-in Priorities:**
 * - Close button: `priority="1000"` (lowest priority)
 *
 * **Custom Focus Behavior:**
 * Override with `onOpenAutoFocus`:
 *
 * ```tsx
 * <SheetContent
 *   onOpenAutoFocus={(event) => {
 *     event.preventDefault();
 *     document.getElementById('my-element')?.focus();
 *   }}>
 * ```
 *
 * The `autoFocusByPriority` function is also exported if you want to compose usage.
 *
 * ## Preventing Implicit Dismiss
 *
 * By default, the Sheet closes when the user clicks outside the content or
 * presses Escape. To require explicit dismissal (e.g., during a multi-step
 * upload flow where an accidental click would lose work), forward
 * `onPointerDownOutside`, `onEscapeKeyDown`, or the combined `onInteractOutside`
 * to `SheetContent` and call `event.preventDefault()`:
 *
 * ```tsx
 * <SheetContent
 *   onInteractOutside={(event) => event.preventDefault()}
 *   onEscapeKeyDown={(event) => event.preventDefault()}>
 * ```
 *
 * The X close affordance and any custom close buttons remain functional.
 *
 * ## SheetTitle Options
 *
 * The `SheetTitle` component supports optional navigation and utility elements:
 *
 * ```tsx
 * <SheetContent>
 *   <SheetTitle
 *     navigation={<IconButton icon='icon-filled-chevron-large-left' ariaLabel='Back' />}
 *     utilities={
 *       <>
 *         <IconButton icon='icon-filled-flag' ariaLabel='Flag' />
 *         <IconButton icon='icon-regular-moon' ariaLabel='Theme' />
 *       </>
 *     }>
 *     Settings
 *   </SheetTitle>
 *   <SheetBody>...</SheetBody>
 * </SheetContent>
 * ```
 *
 * **Options:**
 * - `navigation`: Optional navigation element (typically a back button) displayed on the left
 * - `utilities`: Optional utility elements (typically icon buttons) displayed between the title and close button
 * - Both are optional and can be used independently
 *
 * ## Accessibility
 *
 * **SheetDescription:**
 * Use `SheetDescription` to provide context for screen readers. The description is
 * automatically linked to the dialog via `aria-describedby`:
 *
 * ```tsx
 * <SheetBody>
 *   <SheetDescription>
 *     <p>Fill out the form below to create a new account.</p>
 *   </SheetDescription>
 *   ...
 * </SheetBody>
 * ```
 *
 * **Close Label:**
 * Always provide a meaningful `closeLabel`:
 *
 * ```tsx
 * <SheetContent closeLabel="Close settings panel">
 *   ...
 * </SheetContent>
 * ```
 *
 * ## For Developers
 *
 * ### BaseSheet Component
 *
 * `Sheet` is built on top of the lower-level `BaseSheet` component.
 *
 * ### Safe Area Testing
 *
 * To test how Sheet handles safe area insets (like iPhone notches), use our testing script:
 *
 * ```bash
 * # 1. Start Storybook
 * npm run storybook
 *
 * # 2. Run the safe area test script (in a new terminal)
 * tools/safe-inset-sheet-test/view-safe-area.js
 * ```
 *
 * **What it does:**
 * - Browser windows with different viewports
 * - Emulates 34px safe area insets on all sides using Chrome DevTools Protocol
 * - Adds a red border to visualize the safe area
 * - Tests: Mobile Landscape, Mobile Portrait, Desktop Side, and BaseSheet variants
 *
 * This ensures Sheet works correctly on devices with notches, dynamic islands, and other screen cutouts.
 *
 */
export const SheetRoot = ({ open, onOpenChange, defaultOpen, children }: TSheetRootProps) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen} modal>
      {children}
    </RadixDialog.Root>
  );
};

export type TSheetContentProps = {
  /**
   * [ONLY APPLICABLE FOR CENTERED VARIANT ON LARGE SCREENS]. Ignored otherwise.
   * Medium: 480px, Large: 640px
   */
  centerSheetSize?: TSheetCenteredSize;

  /**
   * The variant of the sheet on large screens.
   * - 'center': Centered on screen (like a dialog)
   * - 'side': Attached to right side of screen
   */
  largeScreenVariant?: TSheetLargeScreenVariant;

  /**
   * The aria label for the close affordance (X button).
   */
  closeLabel?: string;

  /**
   * Optional className for the content.
   */
  className?: string;

  /**
   * Optional className applied when the sheet is in mobile portrait orientation.
   */
  mobilePortraitClassName?: string;

  /**
   * Optional className applied when the sheet is in mobile landscape orientation.
   */
  mobileLandscapeClassName?: string;

  /**
   * Optional className applied when the sheet is on large screens (desktop).
   */
  largeScreenClassName?: string;

  /**
   * Event handler called when focus moves into the component after opening.
   * It can be prevented by calling `event.preventDefault`.
   *
   * By default, Sheet uses `autoFocusByPriority` which focuses elements with
   * `data-autofocus-priority` attribute, selecting the element with the lowest
   * priority number. If no priority elements are found, Radix handles focus normally.
   *
   * Example: `<TextInput data-autofocus-priority="1" />` will be focused before
   * `<Button data-autofocus-priority="10" />`.
   */
  onOpenAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when focus moves to the trigger after closing.
   * It can be prevented by calling `event.preventDefault`.
   */
  onCloseAutoFocus?: (event: Event) => void;

  /**
   * Event handler called when a pointer down event occurs outside the sheet
   * content. Call `event.preventDefault()` to stop the sheet from closing in
   * response to outside pointer interactions (e.g. clicking the overlay).
   */
  onPointerDownOutside?: ComponentProps<typeof RadixDialog.Content>['onPointerDownOutside'];

  /**
   * Event handler called when the Escape key is pressed. Call
   * `event.preventDefault()` to stop the sheet from closing on Escape.
   */
  onEscapeKeyDown?: ComponentProps<typeof RadixDialog.Content>['onEscapeKeyDown'];

  /**
   * Event handler called when an interaction (pointer down or focus) occurs
   * outside the sheet content. Call `event.preventDefault()` to stop the
   * sheet from closing in response to outside interactions.
   */
  onInteractOutside?: ComponentProps<typeof RadixDialog.Content>['onInteractOutside'];

  children?: ReactNode;
};

/**
 * See {@link SheetRoot} documentation for comprehensive documentation.
 * Also exposed in Storybook.
 */
export const SheetContent = ({
  children,
  centerSheetSize = 'Medium',
  largeScreenVariant = 'center',
  closeLabel,
  className,
  mobilePortraitClassName,
  mobileLandscapeClassName,
  largeScreenClassName,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onPointerDownOutside,
  onEscapeKeyDown,
  onInteractOutside
}: TSheetContentProps) => {
  // 600px corresponds to the --breakpoint-small in tailwind
  const isPortraitMobile = useMediaQuery('(orientation: portrait) and (max-width: 600px)');
  const isLandscapeMobile = useMediaQuery('(orientation: landscape) and (max-height: 600px)');

  let type: TBaseSheetType;

  if (isPortraitMobile) {
    type = 'bottomSheet';
  } else if (isLandscapeMobile || largeScreenVariant === 'side') {
    type = 'sideSheet';
  } else {
    type = 'centerSheet';
  }

  const contextValue = useMemo(
    () => ({
      centerSheetSize,
      largeScreenVariant,
      closeLabel,
      isPortraitMobile,
      isLandscapeMobile,
      type
    }),
    [centerSheetSize, largeScreenVariant, closeLabel, isPortraitMobile, isLandscapeMobile, type]
  );

  const responsiveClassName = clsx(
    className,
    isPortraitMobile && mobilePortraitClassName,
    isLandscapeMobile && mobileLandscapeClassName,
    !isPortraitMobile && !isLandscapeMobile && largeScreenClassName
  );

  return (
    <SheetContext.Provider value={contextValue}>
      <BaseSheetContent
        type={type}
        sideSheetSide='right'
        isSideSheetFlush={isLandscapeMobile}
        centerSheetSize={centerSheetSize}
        contentClassName={responsiveClassName}
        onOpenAutoFocus={onOpenAutoFocus ?? dialogAutoFocusByPriority}
        onCloseAutoFocus={onCloseAutoFocus}
        onPointerDownOutside={onPointerDownOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onInteractOutside={onInteractOutside}>
        {children}
      </BaseSheetContent>
    </SheetContext.Provider>
  );
};

type TSheetBodyProps = {
  children?: ReactNode;
  className?: string;
  /**
   * When false, removes the default horizontal padding from the body.
   * Defaults to true.
   */
  hasPaddingX?: boolean;
};

/**
 * The body of the sheet. This is the main content of the sheet.
 * By default, it will scroll if the content is too large.
 *
 * Note that in usage, this component is rendered in a way so that `ref` is not immediately available
 * when `open === true`. So you'll likely want to use a callback ref if you want to trigger anything
 * upon mounting.
 *
 * * See {@link SheetRoot} documentation for comprehensive documentation.
 */
export const SheetBody = forwardRef<HTMLDivElement, TSheetBodyProps>(
  ({ children, className, hasPaddingX = true, ...props }, ref) => {
    const { type } = useSheetContext();
    return (
      <div
        ref={ref}
        className={clsx(
          'scroll-y',
          hasPaddingX && PADDING_X_CLASS,
          type === 'sideSheet' ? 'grow-1' : '',
          className
        )}
        {...props}>
        {children}
      </div>
    );
  }
) as TForwardRefComponent<TSheetBodyProps>;
SheetBody.displayName = 'SheetBody';

/**
 * This is the main title of the sheet.
 *
 * See {@link SheetRoot} documentation for comprehensive documentation.
 */
export const SheetTitle = ({
  className,
  children,
  navigation,
  utilities,
  visuallyHideTitleText
}: {
  children?: ReactNode;
  className?: string;
  /**
   * Optional navigation component (e.g., IconButton) displayed to the left of the title.
   */
  navigation?: ReactNode;
  /**
   * Optional utility components (e.g., IconButtons) displayed between the title and close button.
   */
  utilities?: ReactNode;
  /**
   * When true, the title text is visually hidden but remains accessible to screen readers.
   */
  visuallyHideTitleText?: boolean;
}) => {
  const { closeLabel } = useSheetContext();

  const titleElement = (
    <RadixDialog.Title className='text-heading-small margin-none'>{children}</RadixDialog.Title>
  );

  return (
    <div
      className={clsx(
        className,
        navigation ? 'padding-left-medium' : 'padding-left-xlarge',
        'padding-right-small padding-y-small',
        'flex items-center justify-between'
      )}>
      <div className={clsx('flex items-center', navigation && 'gap-xsmall')}>
        {navigation}
        {visuallyHideTitleText ? <VisuallyHidden>{titleElement}</VisuallyHidden> : titleElement}
      </div>
      <div className={clsx('flex items-center', utilities && 'gap-xxsmall')}>
        {utilities}
        {/* NOTE: Close affordance is always shown, unless we have draggable sheets (which we do not support yet) */}
        <div className='fui-sheet-close-affordance-container'>
          <RadixDialog.Close asChild>
            <IconButton
              variant='Utility'
              size='Medium'
              icon='icon-regular-x'
              ariaLabel={closeLabel || ''}
              data-autofocus-priority='1000'
            />
          </RadixDialog.Close>
        </div>
      </div>
    </div>
  );
};

/**
 * The bottom actions of the sheet. Optional.
 *
 * See {@link SheetRoot} documentation for comprehensive documentation.
 */
export const SheetActions = ({
  children,
  className,
  ...props
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <React.Fragment>
      <Divider />
      <div className={clsx(PADDING_X_CLASS, 'margin-y-small shrink-0', className)} {...props}>
        {children}
      </div>
    </React.Fragment>
  );
};

/**
 * Wrap this around part of the content the describes the sheet.
 * It doesn't add it's own element, but adds an `id` the the content which is then used by
 * `aria-describedby` on the dialog.
 *
 * Example usage:
 * ```
 * <SheetBody>
 *   <SheetDescription>
 *     <p>Update your profile information</p>
 *   </SheetDescription>
 *   // ... other content
 * </SheetBody>
 * ```
 *
 * See {@link SheetRoot} documentation for comprehensive documentation.
 */
export const SheetDescription = (props: { children?: ReactNode }) => {
  return <RadixDialog.Description asChild {...props} />;
};

/**
 * Connects open action to the sheet, as well as auto-focus behavior on close.
 *
 * See {@link SheetRoot} documentation for comprehensive documentation.
 */
export const SheetTrigger = (props: { children?: ReactNode }) => {
  return <RadixDialog.Trigger asChild {...props} />;
};
