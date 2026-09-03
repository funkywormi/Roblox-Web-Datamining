import classNames from "classnames";
import { ComponentProps, ReactNode } from "react";

export type BaseSectionProps = {
  isPrimary?: boolean;
};

function Section({ ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className="self-stretch flex flex-col items-start gap-medium"
      {...props}
    />
  );
}

function SectionHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={classNames(
        "buy-robux-section-header self-stretch flex flex-row items-start text-heading-small medium:text-heading-large",
        className,
      )}
      {...props}
    />
  );
}

function SectionSubHeader({ ...props }: ComponentProps<"div">) {
  return (
    <div
      className={classNames(
        "self-stretch flex flex-row items-start content-emphasis text-body-medium",
        props.className,
      )}
      {...props}
    />
  );
}

export type SectionBodyProps = ComponentProps<"div"> &
  BaseSectionProps & {
    banner?: ReactNode;
  };

function SectionBody({ banner, children, isPrimary, ...props }: SectionBodyProps) {
  if (!banner) {
    return (
      <div
        className={classNames(
          "radius-large flex flex-col items-start self-stretch gap-xlarge padding-xlarge",
          {
            "bg-surface-100": isPrimary,
            "stroke-standard": !isPrimary,
            "stroke-default": !isPrimary,
          },
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={classNames("radius-large flex flex-col items-start self-stretch", {
        "bg-surface-100": isPrimary,
        "stroke-standard": !isPrimary,
        "stroke-default": !isPrimary,
      })}
    >
      {banner}
      <div className="flex flex-col items-start self-stretch gap-xlarge padding-xlarge" {...props}>
        {children}
      </div>
    </div>
  );
}

export { Section, SectionHeader, SectionSubHeader, SectionBody };
