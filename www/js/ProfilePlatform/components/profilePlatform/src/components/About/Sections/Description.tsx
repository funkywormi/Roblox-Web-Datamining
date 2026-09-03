import React, { useMemo, useState } from "react";
import Linkify from "@rbx/linkify";
import { useTranslation } from "@rbx/core-scripts/react";
import { About, Component } from "@rbx/profile-platform";
import EditUserBioModal from "@rbx/profile-common/EditUserBioModal";
import { useIsOwnProfile } from "../../../hooks/useIsOwnProfile";
import SectionHeader from "./SectionHeader";
import useProfileJsonComponent from "../../../hooks/useProfileJsonComponent";
import { SectionKeys } from "../../../constants/enums";
import { useProfilePlatformContext } from "../../../context/ProfilePlatformContext";

type StringWithEscapeHTML = string & { escapeHTML: () => string };

const Description: React.FC<About> = ({ description }) => {
  const { translate } = useTranslation();
  const canEdit = useIsOwnProfile();
  const { refreshProfilePlatform } = useProfilePlatformContext();
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);

  const aboutData = useProfileJsonComponent(Component.About);
  const nameWithAt = `@${aboutData?.name}`;

  // Be cautious editing below code. this can easily create a XSS vulnerability if not handled properly.
  const linkifiedDescription = useMemo(() => {
    if (!description) {
      return translate("Label.NoBioYet");
    }

    // We need to cast content to new type because typescript is unaware of the escapeHTML added to the string prototype
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const escapedContent = (description as StringWithEscapeHTML).escapeHTML();
    return Linkify.String(escapedContent);
  }, [translate, description]);

  return (
    <div key={SectionKeys.Description} className="gap-large flex flex-col">
      <SectionHeader>{translate("Label.AboutDetailsHeading", { name: nameWithAt })}</SectionHeader>

      <div>
        {description ? (
          <pre
            // Should be no vulnerability here because we control the linkified description
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: linkifiedDescription }}
            className="text-wrap text-body-medium text-align-x-left description-content"
          />
        ) : (
          <div className="text-body-medium">{translate("Label.NoBioYet")}</div>
        )}
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setIsBioModalOpen(true);
            }}
            className="text-body-medium edit-bio-btn content-default"
          >
            {translate("Label.EditBio")}
          </button>
        )}
        {isBioModalOpen && (
          <EditUserBioModal
            open={isBioModalOpen}
            onClose={() => {
              setIsBioModalOpen(false);
            }}
            onBioUpdated={() => {
              refreshProfilePlatform().catch(() => undefined);
            }}
            initialBio={description}
          />
        )}
      </div>
    </div>
  );
};

export default Description;
