import React from "react";
import { Intl } from "@rbx/core-scripts/legacy/Roblox";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { translateHtml } from "@rbx/translation-utils";

export type TTranslationLink = {
  opening: string;
  closing: string;
  href: string;
  onClick?: () => void;
};

/**
 * Localizes Roblox content URLs that use `en-us` as their default locale segment.
 * This ensures links supplied with the default locale open in the user's current Roblox locale.
 */
export const buildLinkWithLocale = (url: string): string => {
  const locale = new Intl().getRobloxLocale().replace("_", "-");
  const localedUrl = url.replace("en-us", locale);
  return localedUrl;
};

/**
 * Wrapper around the `translateHtml` function to provide a default, consistent link style
 * across our surfaces.
 */
export const translateWithLinks = (
  translate: TranslateFunction,
  key: string,
  links: TTranslationLink[],
  parameters?: Record<string, string>,
  className = "text-link",
): React.ReactNode[] =>
  translateHtml(
    translate,
    key,
    links.map(({ opening, closing, href, onClick }) => ({
      opening,
      closing,
      render: text => (
        <a className={className} target="_blank" rel="noreferrer" href={href} onClick={onClick}>
          {text}
        </a>
      ),
    })),
    parameters,
  );
