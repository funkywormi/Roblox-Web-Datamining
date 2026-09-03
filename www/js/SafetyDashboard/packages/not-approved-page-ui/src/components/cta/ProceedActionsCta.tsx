import { useState, useEffect, Fragment } from "react";
import { Checkbox, TCheckboxCheckState } from "@rbx/foundation-ui";
import { EventTypes } from "../../telemetry/analytics";
import { useNotApprovedTranslate } from "../../providers/NotApprovedUIProvider";
import NotApprovedProceedButton from "./NotApprovedProceedButton";
import { CtaComponentProps } from "../../pageItemConfigs/ConfigTypes";
import { ProceedAction } from "../../utils/types";
import determineProceedAction from "../../utils/determineProceedAction";
import useSendNotApprovedPageEvent from "../../telemetry/useSendNotApprovedPageEvent";
import SuspensionDurationAlert from "./SuspensionDurationAlert";
import isBanType from "../../utils/isBanType";

const ONE_MINUTE_MS = 60 * 1000;

/**
 * Final page CTA that shows either:
 * - Suspension duration alert (if account is paused)
 * - Rule confirmation checkbox (if account can proceed)
 *
 * Always shows the proceed button.
 */
const ProceedActionsCta = ({ punishmentData, setIsDialogOpen }: CtaComponentProps): JSX.Element => {
  const translate = useNotApprovedTranslate();
  const sendEvent = useSendNotApprovedPageEvent();
  const { endDate, punishmentTypeDescription } = punishmentData;
  const proceedAction = determineProceedAction(punishmentData);

  const [isAgreed, setIsAgreed] = useState(false);
  const [toggleRefresh, setToggleRefresh] = useState(false);

  /**
   * Refreshes the CTA buttons every minute to show the updated time remaining.
   * The useEffect is in a one minute interval since the time suspension duration banner only
   * goes down to minutes (e.g. 00:01 hours). This also helps reduce unnecessary re-renders.
   */
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isBanType(punishmentTypeDescription)) {
      timer = setTimeout(() => {
        setToggleRefresh(prev => !prev);
      }, ONE_MINUTE_MS);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [toggleRefresh, punishmentTypeDescription]);

  const onCheckboxChange = (isChecked: TCheckboxCheckState) => {
    setIsAgreed(isChecked === true);
    sendEvent(EventTypes.CheckboxChecked);
  };

  const isPaused = proceedAction === ProceedAction.Paused;

  return isPaused ? (
    <div className="flex flex-col gap-large medium:flex-row">
      <SuspensionDurationAlert endDate={endDate} />
      <NotApprovedProceedButton
        proceedAction={proceedAction}
        setIsDialogOpen={setIsDialogOpen}
        isAgreed={isAgreed}
        isDisabled
      />
    </div>
  ) : (
    <Fragment>
      <Checkbox
        label={translate("Label.RuleAcknowledgment")}
        placement="Start"
        size="Small"
        isChecked={isAgreed}
        onCheckedChange={onCheckboxChange}
        className="self-start"
        data-testid="rule-confirmation-checkbox"
      />
      <NotApprovedProceedButton
        proceedAction={proceedAction}
        setIsDialogOpen={setIsDialogOpen}
        isAgreed={isAgreed}
        isDisabled={!isAgreed}
      />
    </Fragment>
  );
};

export default ProceedActionsCta;
