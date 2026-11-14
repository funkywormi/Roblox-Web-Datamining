/* eslint-disable react/no-danger */
import { useCallback, useMemo, useState } from "react";
import { useLinkifiedText } from "@rbx/linkify/react";
import { catalogTranslations, itemTranslations } from "../services/translationService";

type TDescriptionTextProps = {
  description: string;
};

function ItemDescription({ description }: TDescriptionTextProps): JSX.Element {
  const [descriptionHasReadMore, setDescriptionHasReadMore] = useState(false);
  const [descriptionTruncationExpanded, setDescriptionTruncationExpanded] = useState(false);

  const descriptionRef = useCallback((elm: HTMLParagraphElement) => {
    if (!elm) return;
    if (elm.offsetHeight > 98) {
      setDescriptionHasReadMore(true);
    }
  }, []);

  const descriptionClass = useMemo(() => {
    const classes = [
      "font-body text description-content wait-for-i18n-format-render content-overflow-toggle",
    ];
    if (descriptionHasReadMore) {
      if (descriptionTruncationExpanded) {
        classes.push("content-overflow-toggle-off");
      } else {
        classes.push("content-height");
      }
    }
    return classes.join(" ");
  }, [descriptionHasReadMore, descriptionTruncationExpanded]);

  const descriptionHtml = useLinkifiedText(description);

  return (
    <div className="clearfix toggle-target item-info-row-container">
      <div className="font-header-1 text-subheader text-label text-overflow row-label">
        {catalogTranslations.labelDescription()}
      </div>
      <div className="row-content">
        <p id="item-details-description" className={descriptionClass} ref={descriptionRef}>
          <span dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </p>
        {!!descriptionHasReadMore && (
          <button
            className="row-content toggle-description text-link cursor-pointer"
            data-container-id="item-details-description"
            data-show-label="Read More"
            data-hide-label="Show Less"
            type="button"
            onClick={() => {
              setDescriptionTruncationExpanded(!descriptionTruncationExpanded);
            }}
          >
            {descriptionTruncationExpanded
              ? itemTranslations.labelShowLess()
              : itemTranslations.labelReadMore()}
          </button>
        )}
      </div>
    </div>
  );
}

export default ItemDescription;
