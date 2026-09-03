import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { IconButton, Button } from "@rbx/foundation-ui";
import { BeduiNodeType } from "../utils/types";
import ArwpSingleStepContentRenderer from "./ArwpSingleStepContentRenderer";
import { useAbuseReportFormData } from "../context/ArwpFormDataProvider";

type Props = {
  curBeduiNode: BeduiNodeType | null;
  stepIdStack: number[];
  onNextStep: (nextStepId: number) => void;
  onPrevStep: () => void;
};

const ArwpSingleStepContainer = ({ curBeduiNode, stepIdStack, onNextStep, onPrevStep }: Props) => {
  const { translate } = useTranslation();
  const footerRef = useRef<HTMLDivElement>(null);
  const [formDataKeysWithError, setFormDataKeysWithError] = useState<string[]>([]);
  const { formData } = useAbuseReportFormData();
  const [hasMadeSubmitAttempt, setHasMadeSubmitAttempt] = useState<boolean>(false);

  const validateCurrentStep = useCallback(() => {
    const tempKeys: string[] = [];
    if (curBeduiNode == null) {
      return tempKeys;
    }

    const { innerContentConfig } = curBeduiNode;
    // TODO: migrated code
    if (innerContentConfig?.type === "configurableComponentList") {
      /**
       * For each component in the configurable component list, check if it requires validation (not optional).
       * If it does require validation, check if the corresponding form data key has a value in the form data map.
       * If it doesn't have a corresponding value, add the form data key to the list of keys with errors.
       */
      innerContentConfig.configurableComponentList.components.forEach(component => {
        switch (component.componentType) {
          case "dropdown":
          case "freeComment":
          case "selector":
            if (!component.isOptional && formData.get(component.formDataKey) == null) {
              tempKeys.push(component.formDataKey);
            }
            break;
          case "link":
          case "paragraph":
          case "reminder":
            // These components take no input
            break;
        }
      });
      setFormDataKeysWithError(tempKeys);
    }
    return tempKeys;
  }, [curBeduiNode, formData]);

  useEffect(() => {
    if (hasMadeSubmitAttempt) {
      validateCurrentStep();
    }
  }, [validateCurrentStep, hasMadeSubmitAttempt]);

  if (curBeduiNode == null) {
    return null;
  }

  const { title, subtitle, innerContentConfig, actionInfo, isCompletionStep } = curBeduiNode;
  const { predefinedNextStepId } = actionInfo;

  return (
    <div className="single-step-container-wrapper">
      <div className="single-step-container">
        <div className="single-step-header-container">
          {stepIdStack.length > 0 && !isCompletionStep && (
            <IconButton
              icon="icon-regular-arrow-large-left"
              className="back-button"
              size="Small"
              ariaLabel={translate("Label.Back")}
              onClick={() => {
                onPrevStep();
              }}
            />
          )}
          {title}
          <div />
        </div>

        {subtitle ? <div className="single-step-title">{subtitle}</div> : null}

        <div className="single-step-center-container">
          <ArwpSingleStepContentRenderer
            contentConfig={innerContentConfig}
            formDataKeysWithError={formDataKeysWithError}
          />
        </div>

        <div className="single-step-footer" ref={footerRef}>
          {curBeduiNode.actionInfo.actionLabel && (
            <Button
              variant="Standard"
              onClick={() => {
                const errorStates = validateCurrentStep();
                if (predefinedNextStepId && errorStates.length === 0) {
                  onNextStep(predefinedNextStepId);
                } else {
                  setHasMadeSubmitAttempt(true);
                }
              }}
            >
              {curBeduiNode.actionInfo.actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArwpSingleStepContainer;
