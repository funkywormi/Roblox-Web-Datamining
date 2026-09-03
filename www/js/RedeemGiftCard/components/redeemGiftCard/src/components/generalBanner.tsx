import React from "react";

type Props = {
  bannerTitle: string;
  bannerContent: string;
  bannerContainerClassName?: string;
  bannerTitleClassName?: string;
  bannerContentClassName?: string;
};

function GeneralBanner({
  bannerTitle,
  bannerContent,
  bannerContainerClassName = "",
  bannerTitleClassName = "",
  bannerContentClassName = "",
}: Props) {
  return (
    <div className={bannerContainerClassName}>
      <h2 className={bannerTitleClassName}>{bannerTitle}</h2>
      <h5 className={bannerContentClassName}>{bannerContent}</h5>
    </div>
  );
}

export default GeneralBanner;
