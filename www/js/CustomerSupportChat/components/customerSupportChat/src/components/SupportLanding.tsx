import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "@rbx/foundation-ui";
import { WithTranslationsProps } from "@rbx/core-scripts/react";
import SupportForm from "../SupportForm";
import SupportFormPrototype from "./support-form-prototype/SupportFormPrototype";
import {
  SupportUiChoice,
  getStoredSupportUiChoice,
  getSupportUiChoiceFromUrl,
  storeSupportUiChoice,
} from "../core/helpers/supportUiPrototype";
import { SupportFormPrefill } from "../core/helpers/supportFormPrefill";
import { useFetchMetadata } from "../hooks/supportFormServices";
import EmployeeOnly from "./employee-only/EmployeeOnly";

const SWITCH_TO_CLASSIC = "Switch to classic support experience";
const SWITCH_TO_NEW = "Switch to new support experience";

const SupportLanding: React.FC<WithTranslationsProps> = props => {
  const { search } = useLocation();
  // Shares the provider's query, so this reads the cached metadata rather than fetching it again.
  const { data: metadata, isError: isMetadataError } = useFetchMetadata();
  const [toggledChoice, setToggledChoice] = useState<SupportUiChoice>();
  // "Use the support form" is offered on an answer whose category has no chatbot flow. It is held
  // in state rather than the URL so it can't be bookmarked to skip the new experience, and a
  // refresh goes back to the new experience.
  const [hasClickedUseSupportForm, setHasClickedUseSupportForm] = useState(false);
  const [supportFormPrefill, setSupportFormPrefill] = useState<SupportFormPrefill>();

  // Only employees can pick their experience; everyone else gets what the backend decided.
  const isEmployee = metadata?.isRobloxEmployee === true;
  const urlChoice = isEmployee ? getSupportUiChoiceFromUrl(search) : undefined;

  useEffect(() => {
    if (urlChoice) {
      storeSupportUiChoice(urlChoice);
    }
  }, [urlChoice]);
  // Which experience to show depends on metadata, so wait for it rather than flash one experience
  // and swap to the other. A failed fetch falls through to the support form.
  if (metadata === undefined && !isMetadataError) {
    return (
      <span role="progressbar" aria-label="Loading content" className="spinner spinner-default" />
    );
  }

  const getShowNewExperience = (): boolean => {
    if (hasClickedUseSupportForm) {
      return false;
    }
    if (!isEmployee) {
      return metadata?.isNewSupportExperienceEnabled === true;
    }
    // Employees always pass the backend gate, so they start on the classic form and opt in: the
    // switch this visit, then the URL, then their stored choice.
    return (toggledChoice ?? urlChoice ?? getStoredSupportUiChoice()) === "prototype";
  };
  const showNewExperience = getShowNewExperience();

  const switchTo = (choice: SupportUiChoice) => {
    storeSupportUiChoice(choice);
    setToggledChoice(choice);
    setHasClickedUseSupportForm(false);
    setSupportFormPrefill(undefined);
  };

  return (
    // Out of the flow, so the switch sits in the corner of #support without shifting either layout.
    <div className="relative">
      {isEmployee && (
        <div
          className="absolute top-0 right-0 rtl:right-auto rtl:left-0 z-10 ltr:margin-right-small rtl:margin-left-small"
          data-testid="support-ui-switch"
        >
          <EmployeeOnly className="bg-surface-100">
            <Link
              as="button"
              type="button"
              underline="always"
              className="text-caption-medium"
              onClick={() => {
                switchTo(showNewExperience ? "classic" : "prototype");
              }}
              data-testid="support-ui-toggle"
            >
              {showNewExperience ? SWITCH_TO_CLASSIC : SWITCH_TO_NEW}
            </Link>
          </EmployeeOnly>
        </div>
      )}
      {showNewExperience ? (
        <SupportFormPrototype
          onUseSupportForm={prefill => {
            setSupportFormPrefill(prefill);
            setHasClickedUseSupportForm(true);
          }}
        />
      ) : (
        <SupportForm {...props} prefill={supportFormPrefill} />
      )}
    </div>
  );
};

export default SupportLanding;
