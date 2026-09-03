import { TBadgeProps, TButtonProps } from "../types/upsellCardTypes";

const isCompactUpsellBannerConfig = ({
  badgePropsArray,
  buttonPropsArray,
  dismissible,
  bodyText,
}: {
  badgePropsArray: TBadgeProps[];
  buttonPropsArray: TButtonProps[];
  dismissible: boolean;
  bodyText?: string;
}): boolean => {
  return badgePropsArray.length === 0 && buttonPropsArray.length < 2 && !dismissible && !bodyText;
};

export default isCompactUpsellBannerConfig;
