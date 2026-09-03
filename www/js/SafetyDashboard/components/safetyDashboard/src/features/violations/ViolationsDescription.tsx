import { useTranslation } from "@rbx/core-scripts/react";
import { translateHtml } from "@rbx/translation-utils";
import { SUPPORT_FORM_URL } from "../../shared/url";
import { onSupportClick } from "./SupportItem";

type ViolationsDescriptionVariant = "error" | "empty" | "default";

interface ViolationsDescriptionProps {
  variant: ViolationsDescriptionVariant;
}

/**
 * Description rendered on the violations surfaces. The message depends on the variant: a plain
 * error message, or an empty-state / support-form fallback that links the user to the Customer Support form.
 */
const ViolationsDescription = ({ variant }: ViolationsDescriptionProps) => {
  const { translate } = useTranslation();

  return (
    <p data-testid="violations-description" className="text-body-medium content-default">
      {variant === "error"
        ? translate("Response.UnexpectedError")
        : translateHtml(
            translate,
            variant === "empty"
              ? "Description.NoRecentViolations"
              : "Description.SupportFormFallback",
            [
              {
                opening: "linkStart",
                closing: "linkEnd",
                render: text => (
                  <a
                    href={SUPPORT_FORM_URL}
                    onClick={onSupportClick}
                    className="content-default underline"
                    /**
                     * The default underline sits too close to the text compared to the Figma design,
                     * and there's no Foundation Tailwind token for the offset, so we set it inline.
                     */
                    style={{ textUnderlineOffset: "3px" }}
                  >
                    {text}
                  </a>
                ),
              },
            ],
          )}
    </p>
  );
};

export default ViolationsDescription;
