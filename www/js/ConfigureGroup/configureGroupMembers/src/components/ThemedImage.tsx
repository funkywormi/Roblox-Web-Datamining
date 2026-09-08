import type { FunctionComponent, ImgHTMLAttributes } from 'react';
import React from 'react';
import { useTheme } from '@rbx/ui';

export type ThemedImageProps = {
  lightSrc: string;
  darkSrc?: string;
  alt: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'>;

const ThemedImage: FunctionComponent<ThemedImageProps> = ({
  lightSrc,
  darkSrc,
  alt,
  ...imgProps
}) => {
  const { palette } = useTheme();
  const src = palette.mode === 'dark' ? (darkSrc ?? lightSrc) : lightSrc;

  return <img src={src} alt={alt} {...imgProps} />;
};

export default ThemedImage;
