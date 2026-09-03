import React, { useCallback, useMemo, useState } from "react";
import Linkify from "@rbx/linkify";
import { useTranslation } from "@rbx/core-scripts/react";
import { Component } from "@rbx/profile-platform";
import useProfileJsonComponent from "../../hooks/useProfileJsonComponent";
import AboutDialog from "./AboutDialog";
import useAboutSectionsFromData from "../../hooks/useAboutSectionsFromData";

type StringWithEscapeHTML = string & { escapeHTML: () => string };

const AboutContainer: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const aboutData = useProfileJsonComponent(Component.About);
  const sections = useAboutSectionsFromData(aboutData);
  const { translate } = useTranslation();

  const openModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const description = aboutData?.description;

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

  if (!aboutData) {
    return null;
  }

  return (
    <div>
      <pre
        className="content-default text-body-medium text-overflow-2-lines description-content"
        // Should be no vulnerability here because we control the linkified description
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: linkifiedDescription }}
      />
      <button
        type="button"
        onClick={openModal}
        aria-label={translate("Label.More")}
        className="text-body-medium more-btn content-default"
      >
        {translate("Label.More")}
      </button>
      <AboutDialog open={modalOpen} onClose={closeModal} sections={sections} />
    </div>
  );
};

export default AboutContainer;
