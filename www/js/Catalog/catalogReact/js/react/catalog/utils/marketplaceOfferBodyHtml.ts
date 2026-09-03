import { EMBEDDABLE_ROBUX_TOKEN_PATTERN } from '../components/EmbeddableText';

const ROBUX_ICON_HTML =
  '<span class="icon-robux-16x16 inline-block align-text-bottom" aria-hidden="true"></span>';

/** Replaces embeddable Robux tokens in API HTML strings with icon markup for dangerouslySetInnerHTML. */
export default function prepareMarketplaceOfferBodyHtml(html: string): string {
  return html.replace(new RegExp(EMBEDDABLE_ROBUX_TOKEN_PATTERN.source, 'gi'), ROBUX_ICON_HTML);
}
