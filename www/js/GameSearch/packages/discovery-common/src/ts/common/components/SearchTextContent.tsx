import { useSanitizedHtmlLinkText } from "@rbx/game-play-button";
import { TOmniSearchTextDataModel } from "../types/bedev2Types";

export default function SearchTextContent({
  textData,
}: {
  textData: TOmniSearchTextDataModel;
}): JSX.Element {
  const sanitizedText = useSanitizedHtmlLinkText(textData.name, {
    shouldOpenLinksInNewTab: true,
  });

  return (
    <div
      data-testid="games-search-search-text-content"
      className="games-search-search-text-content"
      // Sanitized via dompurify — safe to set innerHTML
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizedText }}
    />
  );
}
