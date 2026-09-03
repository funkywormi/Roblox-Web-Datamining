import React from "react";

export type NotificationStreamBannerVariant = "new" | "error";

export type NotificationStreamBannerProps = {
  variant: NotificationStreamBannerVariant;
  message: string;
  onClick?: () => void;
  onDismiss?: () => void;
  dismissAriaLabel?: string;
};

export const NotificationStreamBanner = ({
  variant,
  message,
  onClick,
  onDismiss,
  dismissAriaLabel = "Dismiss",
}: NotificationStreamBannerProps): JSX.Element => {
  const clickable = Boolean(onClick);
  return (
    <div
      className={`notification-stream-banner-v2 notification-stream-banner-v2--${variant} flex items-center gap-small padding-x-large padding-y-small width-full text-label-small`}
      role={clickable ? "button" : "status"}
      tabIndex={clickable ? 0 : undefined}
      style={{
        cursor: clickable ? "pointer" : undefined,
        marginBottom: 8,
      }}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? event => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <span className="notification-stream-banner-v2__text fill basis-0 min-width-0">
        {message}
      </span>
      {onDismiss && (
        <button
          type="button"
          className="notification-stream-banner-v2__close flex items-center shrink-0"
          aria-label={dismissAriaLabel}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            padding: "0 4px",
            lineHeight: 1,
          }}
          onClick={event => {
            event.stopPropagation();
            onDismiss();
          }}
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
};

export default NotificationStreamBanner;
