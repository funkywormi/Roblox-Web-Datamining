import React, { AnchorHTMLAttributes, forwardRef, PropsWithChildren } from 'react';

type ContentPreviewCardProps = PropsWithChildren<
  {
    href: string;
    blockedSelector: string;
    onNavigate?: () => void;
    onModifiedClick?: () => void;
  } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>
>;

const ContentPreviewCard = forwardRef<HTMLAnchorElement, ContentPreviewCardProps>(
  ({ href, blockedSelector, onNavigate, onModifiedClick, children, ...anchorProps }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.target instanceof Element && event.target.closest(blockedSelector)) {
        if (event.target.closest('a[href]') === event.currentTarget) {
          event.preventDefault();
        }

        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        onModifiedClick?.();
        return;
      }

      if (!onNavigate) {
        return;
      }

      event.preventDefault();
      onNavigate();
    };

    return (
      <a ref={ref} href={href} onClick={handleClick} {...anchorProps}>
        {children}
      </a>
    );
  }
);

ContentPreviewCard.displayName = 'ContentPreviewCard';

ContentPreviewCard.defaultProps = {
  onNavigate: undefined,
  onModifiedClick: undefined
};

export default ContentPreviewCard;
