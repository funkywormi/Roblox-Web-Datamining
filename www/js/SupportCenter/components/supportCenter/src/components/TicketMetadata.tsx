import React from "react";
import { TranslateFunction, useTranslation } from "@rbx/core-scripts/react";
import { getForumPostUrl } from "../utils/urls";
import { parseForumPostSourceId } from "../utils/sourceHelper";

interface TicketMetadataProps {
  metadata: Record<string, string | number | boolean>;
}

const METADATA_KEY_TO_TRANSLATION_KEY: Record<string, string> = {
  platform_type: "Label.Metadata.PlatformType",
  device_type: "Label.Metadata.DeviceType",
  request_country_code: "Label.Metadata.RequestCountryCode",
  client_version: "Label.Metadata.ClientVersion",
  community_post: "Label.Metadata.ForumPost",
};

const METADATA_RENDERERS: Record<
  string,
  (value: string, options: { translate: TranslateFunction }) => React.ReactNode
> = {
  community_post: (value: string, { translate }: { translate: TranslateFunction }) => {
    // groups-service stores this as the string `{groupId}_{categoryId}_{postId}`; parse the same
    // shape the return-link banner uses so the ticket detail can link back to the forum post.
    const parsed = parseForumPostSourceId(value);
    if (!parsed) {
      return null;
    }
    const forumsUrl = getForumPostUrl(parsed);
    return (
      <a
        className="content-link hover:underline"
        href={forumsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate("Label.Link")}
      </a>
    );
  },
};

const TicketMetadata: React.FC<TicketMetadataProps> = ({ metadata }) => {
  const { translate } = useTranslation();

  const valueNodes = Object.entries(metadata).map(([key, value]) => {
    if (!value) return null;

    const translationKey = METADATA_KEY_TO_TRANSLATION_KEY[key];
    const renderer = METADATA_RENDERERS[key];
    const valueNode = renderer ? renderer(String(value), { translate }) : String(value);

    if (!valueNode) return null;

    return (
      <div key={key}>
        <span className="text-label-medium">
          {translationKey ? translate(translationKey) : key}
        </span>
        <span className="text-body-medium margin-left-small">{valueNode}</span>
      </div>
    );
  });

  const hasValidMetadata = valueNodes.some(node => Boolean(node));
  if (!hasValidMetadata) return null;

  return (
    <div className="margin-top-small">
      <h4 className="text-title-medium">{translate("Heading.Metadata")}</h4>
      {valueNodes}
    </div>
  );
};

export default TicketMetadata;
