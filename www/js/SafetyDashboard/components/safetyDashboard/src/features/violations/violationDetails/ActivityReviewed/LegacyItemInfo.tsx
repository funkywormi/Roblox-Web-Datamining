import { Fragment } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { EnrichedViolation } from "../../util/violations";
import { isAssetContent, isBundleContent, isChatContent, isLookContent } from "../../util/types";
import { parseLookId } from "../../util/looksUtil";
import EvidenceField from "../EvidenceField";
import { formatter } from "../../util/dateTime";

interface Props {
  content: EnrichedViolation["content"];
  createTime?: string;
}

// TODO: In the future, this should be added to the translations themselves.
const COLON = ":";

/**
 * When the violation does not have valid platform evidence available, we fallback to showing
 * the legacy item info.
 */
const LegacyItemInfo = ({ content, createTime }: Props) => {
  const { translate } = useTranslation();

  if (!content) {
    return null;
  }

  return (
    <div className="flex flex-col gap-small" data-testid="itemDescription">
      {isAssetContent(content) && (
        <Fragment>
          <EvidenceField
            fieldLabel={translate("Label.AssetName")}
            fieldValue={content.display_name ?? ""}
          />
          <EvidenceField fieldLabel={translate("Label.AssetId")} fieldValue={content.asset_id} />
        </Fragment>
      )}

      {isBundleContent(content) && (
        <Fragment>
          <EvidenceField
            fieldLabel={translate("Label.BundleName")}
            fieldValue={content.display_name ?? ""}
          />
          <EvidenceField fieldLabel={translate("Label.BundleId")} fieldValue={content.bundle_id} />
        </Fragment>
      )}

      {isLookContent(content) && (
        <Fragment>
          {content.name && (
            <EvidenceField fieldLabel={translate("Label.LookName")} fieldValue={content.name} />
          )}
          <EvidenceField
            fieldLabel={translate("Label.LookId")}
            fieldValue={parseLookId(content.id)}
          />
        </Fragment>
      )}

      {isChatContent(content) && (
        <Fragment>
          <EvidenceField
            fieldLabel={translate("Label.Location")}
            fieldValue={
              content.experience_name && content.experience_name.length > 0
                ? content.experience_name
                : translate("Label.Type.Chat")
            }
          />
          <div className="flex flex-col">
            <span className="text-title-medium">
              {translate("Label.Type.Chat")}
              {COLON}
            </span>
            <pre className="text-body-medium content-default">
              {content.chatlines.map(line => `${content.username}: ${line}`).join("\n")}
            </pre>
          </div>
        </Fragment>
      )}

      {createTime && (
        <EvidenceField
          fieldLabel={translate("Label.ReviewDate")}
          fieldValue={formatter.getFullDate(createTime)}
        />
      )}
    </div>
  );
};

export default LegacyItemInfo;
