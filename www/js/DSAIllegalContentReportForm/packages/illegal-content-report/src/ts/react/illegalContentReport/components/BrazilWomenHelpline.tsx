import React from "react";
import { useTranslations } from "../../util/translation";

/**
 * Prominent 180 helpline callout for Brazil women reporting forms.
 * Kept on the forms only (not the report-type selector).
 */
const BrazilWomenHelpline: React.FC = () => {
  const { translate } = useTranslations();
  const title = translate("Title.BrazilWomenHelpline");

  return (
    <aside
      id="brazil-women-helpline"
      className="section brazil-women-helpline"
      data-testid="brazil-women-helpline"
      aria-label={title}
    >
      <p className="brazil-women-helpline__title">{title}</p>
      <p className="brazil-women-helpline__dial">
        <a href="tel:180" className="brazil-women-helpline__link">
          {translate("Action.BrazilWomenHelpline.Call180")}
        </a>
      </p>
    </aside>
  );
};

export default BrazilWomenHelpline;
