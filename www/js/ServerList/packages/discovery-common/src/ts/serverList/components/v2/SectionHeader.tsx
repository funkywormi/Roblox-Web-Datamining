import React from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
  <div className="flex flex-col gap-xsmall">
    <h3 className="text-heading-small content-emphasis padding-none">{title}</h3>
    {subtitle && <span className="text-body-medium content-muted">{subtitle}</span>}
  </div>
);

export default SectionHeader;
