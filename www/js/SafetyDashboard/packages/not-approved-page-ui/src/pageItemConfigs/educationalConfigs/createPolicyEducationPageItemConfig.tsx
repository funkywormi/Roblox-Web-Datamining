import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import { NAPageItemConfigType } from "../ConfigTypes";

export type PolicyEducationContent = {
  title: string;
  subtitle?: string;
  description: string;
  /** Optional field that gets rendered as a list of bullets under the description. */
  descriptionBullets?: string;
  /** Unique identifier for the policy section (e.g., "swearing-rule", "bullying-importance") */
  policyKey: string;
};

const BULLET = "•";

/**
 * Splits text by newlines and trims whitespace from each line.
 * Returns only non-empty lines after trimming.
 */
const splitByNewlines = (text: string): string[] => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);
};

/**
 * Factory function to create a policy education page item config.
 *
 * This is a generic component that can be used for both rule pages and importance pages,
 * or any other policy education content. The component simply displays a title and description.
 */
const createPolicyEducationPageItemConfig = (
  content: PolicyEducationContent,
): NAPageItemConfigType => {
  const PolicyEducationPageItem = (): JSX.Element => {
    const translate = useNotApprovedTranslate();

    // Translate and split description by newlines
    const translatedDescription = translate(content.description);
    const descriptionLines = splitByNewlines(translatedDescription);

    // Translate and split bullets by newlines if they exist
    const translatedBullets = content.descriptionBullets
      ? translate(content.descriptionBullets)
      : undefined;
    const bulletLines = translatedBullets ? splitByNewlines(translatedBullets) : [];

    return (
      <div className="flex flex-col gap-medium" data-testid={content.policyKey}>
        <span className="text-heading-medium">{translate(content.title)}</span>

        {content.subtitle && (
          <span className="text-title-large">{translate(content.subtitle)}</span>
        )}

        {/* Content Section */}
        <div className="flex flex-col gap-small">
          {descriptionLines.length > 0 && (
            <div className="flex flex-col gap-medium">
              {descriptionLines.map(line => (
                <p key={line} className="text-body-large">
                  {line}
                </p>
              ))}
            </div>
          )}

          {bulletLines.length > 0 && (
            <div className="flex flex-col gap-xsmall padding-left-small">
              {bulletLines.map(line => (
                <div key={line} className="flex flex-row gap-small">
                  <p className="text-body-large">{BULLET}</p>
                  <p className="text-body-large">{line}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    getIsVisible: () => true,
    renderComponent: PolicyEducationPageItem,
    configName: content.policyKey,
  };
};

export default createPolicyEducationPageItemConfig;
