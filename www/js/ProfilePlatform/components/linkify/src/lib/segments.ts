import linkifyConstants from "../constants/linkifyConstants";

const { cssClass, hasProtocolRegex, regex, robloxDomainSuffixes } = linkifyConstants;

type Link = {
  readonly offset: number;
  readonly length: number;
  readonly text: string;
  readonly href: string;
  readonly target: "_blank" | undefined;
  readonly rel: string;
};

export type AlertSegment =
  | { readonly type: "text"; readonly text: string }
  | ({ readonly type: "link" } & Omit<Link, "length">);

// .NET linkifies the element's innerHTML, where a text node serializes with these escapes.
const encodeTextNode = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u00a0/g, "&nbsp;");

const decodeTextNode = (html: string) =>
  html
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const encodeAttribute = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\u00a0/g, "&nbsp;");

// A match's authority is always one of the regex's domains; a scheme-less href is page-relative and pages are Roblox hosts.
const isRobloxDomain = (href: string) => {
  const host = /^https?:\/\/([^/?#]*)/.exec(href)?.[1];
  return host == null || robloxDomainSuffixes.some(suffix => host.endsWith(suffix));
};

const makeLink = (match: string, offset: number, isPhone: boolean): Link => {
  // Input is often HTML encoded
  const text = match.replace(/&amp;/g, "&");
  let href = text.replace(/\.+$/g, "");
  if (!hasProtocolRegex.test(href)) {
    href = `https://${href}`;
  }
  href = href.replace("http://", "https://");
  return {
    offset,
    length: match.length,
    text,
    href,
    // Mobile links have to open in the same tab
    target: isPhone ? undefined : "_blank",
    // noreferrer keeps the Referer header from third parties
    rel: isRobloxDomain(href) ? "noopener" : "noopener noreferrer",
  };
};

const findLinks = (html: string, isPhone: boolean): Link[] =>
  Array.from(html.matchAll(regex), match => makeLink(match[0], match.index, isPhone));

/** Splits alert text into text and links the way .NET's Linkify does on `.linkify` elements. */
export const linkifyAlert = (text: string, isPhone: boolean): AlertSegment[] => {
  const html = encodeTextNode(text);
  const segments: AlertSegment[] = [];
  let index = 0;
  for (const { length, ...link } of findLinks(html, isPhone)) {
    if (link.offset > index) {
      segments.push({ type: "text", text: decodeTextNode(html.slice(index, link.offset)) });
    }
    segments.push({ type: "link", ...link });
    index = link.offset + length;
  }
  if (index < html.length) {
    segments.push({ type: "text", text: decodeTextNode(html.slice(index)) });
  }
  return segments;
};

/** Replaces each link in an HTML string with the anchor markup `Linkify.String` returns. */
export const linkifyHtml = (html: string, isPhone: boolean): string => {
  let out = "";
  let index = 0;
  for (const link of findLinks(html, isPhone)) {
    const target = link.target == null ? "" : ` target="${link.target}"`;
    out += `${html.slice(index, link.offset)}<a class="${cssClass}" href="${encodeAttribute(link.href)}"${target} rel="${link.rel}">${encodeTextNode(link.text)}</a>`;
    index = link.offset + link.length;
  }
  return out + html.slice(index);
};
