import React from 'react';
import classNames from 'classnames';

export type AttachmentCardProps = {
  /** Tile on the leading edge — an icon placeholder, or a preview once populated. */
  media?: React.ReactNode;
  /** `Large` is the wide image-preview tile; `Small` is the square icon tile. */
  mediaSize?: 'Large' | 'Small';
  title?: string;
  description?: string;
  /** Trailing action, e.g. an "Upload image" or "Add poll" button. */
  action?: React.ReactNode;
  /** Rendered beneath the summary row, inside the card (e.g. a poll preview). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * Bordered card used by the announcement composer's Image and Attachments items: a media tile,
 * title/description copy and a trailing action, with optional content beneath.
 */
const AttachmentCard: React.FC<AttachmentCardProps> = ({
  media,
  mediaSize = 'Large',
  title,
  description,
  action,
  children,
  className
}) => {
  const hasRow = !!(media || title || description || action);
  return (
    <div
      className={classNames(
        'attachment-card radius-large stroke-standard stroke-default',
        className
      )}>
      {hasRow && (
        <div className='attachment-card-row'>
          {media && (
            <div
              className={classNames(
                'attachment-card-media radius-medium bg-surface-200',
                mediaSize === 'Small' && 'attachment-card-media-small'
              )}>
              {media}
            </div>
          )}
          {(title || description) && (
            <div className='attachment-card-copy'>
              {title && <p className='text-title-medium content-emphasis'>{title}</p>}
              {description && <p className='text-body-medium content-default'>{description}</p>}
            </div>
          )}
          {action && <div className='attachment-card-action'>{action}</div>}
        </div>
      )}
      {children && <div className='attachment-card-body'>{children}</div>}
    </div>
  );
};

AttachmentCard.displayName = 'AttachmentCard';

export default AttachmentCard;
