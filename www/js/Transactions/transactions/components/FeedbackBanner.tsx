import clsx from 'clsx';
import React, { ComponentPropsWithRef, ReactNode, forwardRef } from 'react';
import type {
  TTailwindBgClass,
  TTailwindIconClass,
  TTailwindStrokeClass
} from '@rbx/foundation-tailwind/classes';
import { Icon } from './Icon';
import { Button } from './Button';
import { CloseAffordance } from './internal/CloseAffordance';
import { TForwardRefComponent } from './types/TForwardRefComponent';

export const feedbackBannerLayouts = ['Inline', 'Stacked'] as const;
export type TFeedbackBannerLayout = (typeof feedbackBannerLayouts)[number];

export const feedbackBannerVariants = ['Standard', 'Emphasis'] as const;
export type TFeedbackBannerVariant = (typeof feedbackBannerVariants)[number];

export const feedbackBannerSeverities = ['Info', 'Warning', 'Success', 'Error'] as const;
export type TFeedbackBannerSeverity = (typeof feedbackBannerSeverities)[number];

type TFeedbackBannerBaseProps = Omit<ComponentPropsWithRef<'div'>, 'title'> & {
  title: string | ReactNode;
  description?: string | ReactNode;
  linkLabel?: string;
  linkHref?: string;
  onLinkClick?: () => void;
  showIcon?: boolean;
  layout?: TFeedbackBannerLayout;
  variant?: TFeedbackBannerVariant;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  actions?: ReactNode;
  onDismiss?: () => void;
  dismissIconAriaLabel?: string;
};

export type TFeedbackBannerProps = TFeedbackBannerBaseProps &
  (
    | { severity?: 'Info'; infoIconOverride?: TTailwindIconClass }
    | { severity: Exclude<TFeedbackBannerSeverity, 'Info'>; infoIconOverride?: never }
  );

const EMPHASIS_BACKGROUND_OPACITY = 0.05;

const EMPHASIS_BACKGROUND_COLOR_BY_SEVERITY: Record<TFeedbackBannerSeverity, string> = {
  Info: `rgb(from var(--color-system-emphasis) r g b / ${EMPHASIS_BACKGROUND_OPACITY})`,
  Warning: `rgb(from var(--color-system-warning) r g b / ${EMPHASIS_BACKGROUND_OPACITY})`,
  Success: `rgb(from var(--color-system-success) r g b / ${EMPHASIS_BACKGROUND_OPACITY})`,
  Error: `rgb(from var(--color-system-alert) r g b / ${EMPHASIS_BACKGROUND_OPACITY})`
};

const STROKE_COLOR_BY_SEVERITY: Record<TFeedbackBannerSeverity, TTailwindStrokeClass> = {
  Info: 'stroke-system-emphasis',
  Warning: 'stroke-system-warning',
  Success: 'stroke-system-success',
  Error: 'stroke-system-alert'
};

const ICON_BY_SEVERITY: Record<TFeedbackBannerSeverity, TTailwindIconClass> = {
  Info: 'icon-filled-circle-i',
  Warning: 'icon-filled-triangle-exclamation',
  Success: 'icon-filled-circle-check',
  Error: 'icon-filled-circle-x'
};

const ICON_STANDARD_COLOR_BY_SEVERITY: Record<TFeedbackBannerSeverity, string> = {
  Info: 'var(--inverse-system-emphasis)',
  Warning: 'var(--inverse-system-warning)',
  Success: 'var(--inverse-system-success)',
  Error: 'var(--inverse-system-alert)'
};

const ACTION_EMPHASIS_BACKGROUND_BY_SEVERITY: Record<TFeedbackBannerSeverity, TTailwindBgClass> = {
  Info: 'bg-action-standard',
  Warning: 'bg-inverse-action-standard',
  Success: 'bg-inverse-action-standard',
  Error: 'bg-action-standard'
};

// TODO (mbae 1/17/26): The left-hand icon's inner symbol should be white and not black in certain cases.
// Will revisit this in a future PR
const FeedbackBannerComponent = (
  {
    title,
    description,
    linkLabel,
    linkHref,
    onLinkClick,
    showIcon = true,
    infoIconOverride,
    layout = 'Inline',
    variant = 'Standard',
    severity = 'Info',
    primaryActionLabel,
    onPrimaryAction,
    secondaryActionLabel,
    onSecondaryAction,
    actions,
    onDismiss,
    dismissIconAriaLabel = 'Dismiss banner',
    className,
    style,
    ...rest
  }: TFeedbackBannerProps,
  ref: ComponentPropsWithRef<'div'>['ref']
) => {
  const backgroundEmphasisStyle = EMPHASIS_BACKGROUND_COLOR_BY_SEVERITY[severity];
  const actionBackgroundClass =
    variant === 'Emphasis' ? ACTION_EMPHASIS_BACKGROUND_BY_SEVERITY[severity] : '';
  const role = severity === 'Warning' || severity === 'Error' ? 'alert' : 'status';
  const iconName =
    severity === 'Info' && infoIconOverride ? infoIconOverride : ICON_BY_SEVERITY[severity];
  const isStacked = layout === 'Stacked';
  const hasActionContent =
    Boolean(actions) ||
    Boolean(primaryActionLabel && onPrimaryAction) ||
    Boolean(secondaryActionLabel && onSecondaryAction);
  const linkContent = linkLabel && (
    <span className={clsx('text-body-medium underline content-default block text-no-wrap')}>
      {linkLabel}
    </span>
  );

  const link = linkContent && (
    <React.Fragment>
      <span> · </span>
      <a className='shrink-0' href={linkHref} onClick={onLinkClick}>
        {linkContent}
      </a>
    </React.Fragment>
  );

  const actionsContent =
    actions ??
    ((primaryActionLabel && onPrimaryAction) || (secondaryActionLabel && onSecondaryAction) ? (
      <div className='flex items-center gap-small'>
        {primaryActionLabel && onPrimaryAction && (
          <Button
            size='Small'
            variant='Standard'
            onClick={onPrimaryAction}
            className={clsx('content-emphasis label-small', actionBackgroundClass)}>
            {primaryActionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            size='Small'
            variant='Utility'
            onClick={onSecondaryAction}
            className={clsx('content-emphasis label-small')}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    ) : null);

  const dismissButton = onDismiss && (
    <CloseAffordance
      variant='Utility'
      size='Small'
      isCircular
      className='content-emphasis'
      aria-label={dismissIconAriaLabel}
      onClick={onDismiss}
    />
  );

  return (
    <div
      ref={ref}
      role={role}
      className={clsx(
        'foundation-web-feedback-banner flex flex-col gap-small radius-medium padding-large stroke-standard',
        variant === 'Standard' ? 'bg-shift-100' : undefined,
        variant === 'Standard' ? 'stroke-default' : STROKE_COLOR_BY_SEVERITY[severity],
        className
      )}
      style={{
        backgroundColor: variant === 'Emphasis' ? backgroundEmphasisStyle : undefined,
        ...style
      }}
      {...rest}>
      <div
        className={clsx(
          'flex width-full gap-medium',
          isStacked ? 'items-start' : 'items-center flex-wrap'
        )}>
        <div
          className={clsx(
            'flex grow-1 min-width-0',
            isStacked ? 'flex-col gap-medium basis-0' : 'items-center gap-xsmall'
          )}>
          <div
            className={clsx(
              'flex min-width-0',
              isStacked ? 'gap-medium flex-col grow-1 basis-0' : 'gap-xsmall items-center'
            )}>
            <div className={clsx('flex items-center gap-xsmall min-width-0')}>
              <div className={clsx('flex items-center gap-medium min-width-0')}>
                {showIcon && iconName && (
                  <Icon
                    name={iconName}
                    size='Large'
                    className='shrink-0'
                    style={{ color: ICON_STANDARD_COLOR_BY_SEVERITY[severity] }}
                  />
                )}
                <span
                  className={clsx(
                    'text-label-medium content-emphasis',
                    isStacked
                      ? ''
                      : 'block padding-y-xsmall text-truncate-end text-no-wrap min-width-0 grow-1 basis-0'
                  )}>
                  {title}
                </span>
              </div>
              {isStacked && link}
            </div>
            {description &&
              (isStacked ? (
                <div
                  className={clsx(
                    'text-body-medium text-truncate-split content-default width-full'
                  )}>
                  {description}
                </div>
              ) : (
                <React.Fragment>
                  <span className='text-body-medium text-truncate-end content-default block text-no-wrap min-width-0 fill'>
                    {description}
                  </span>
                  <span className='flex items-center gap-xsmall'>{link}</span>
                </React.Fragment>
              ))}
            {!isStacked && !description && link && (
              <div className='flex items-center gap-xsmall'>{link}</div>
            )}
          </div>
          {isStacked && hasActionContent && actionsContent}
        </div>
        {!isStacked && (hasActionContent || onDismiss) && (
          <div className='flex items-center justify-end gap-small shrink-0'>
            {hasActionContent && actionsContent}
            {dismissButton}
          </div>
        )}
        {isStacked && dismissButton && <div className='shrink-0'>{dismissButton}</div>}
      </div>
    </div>
  );
};

/**
 * @deprecated This component is deprecated in place of `Alert`.
 * Please work with your designers and #foundation-web to migrate to the new component.
 */
export const FeedbackBanner = forwardRef(
  FeedbackBannerComponent
) as TForwardRefComponent<TFeedbackBannerProps>;
