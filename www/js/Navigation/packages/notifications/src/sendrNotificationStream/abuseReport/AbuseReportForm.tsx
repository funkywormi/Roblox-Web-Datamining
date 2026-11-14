import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ProgressCircle } from "@rbx/foundation-ui";
import { useNotificationLocalization } from "../context/NotificationsLocalization";
import { getNotificationStreamHost } from "../../notificationStreamData/streamHost";
import { getFlaggedMuiModalArms, getMuiModalArms } from "../mui/muiModalArms";
import {
  AbuseReportFormData,
  AbuseReportFormProps,
  EntryPoint,
  ReportedTags,
} from "./abuseReportFormType";
import AbuseReportInput from "./AbuseReportInput";
import { getReportConfiguration, sendEventStreamEvent, sendReport } from "./abuseReportService";
import ABUSE_REPORT_EVENTS from "./constants/eventConstants";

const AbuseReportForm: FC<AbuseReportFormProps> = ({
  customRender,
  onSubmit,
  defaultFormValues,
  formActions,
  reportedEntity,
  reporterId,
}) => {
  // TODO: Add loading state, when fetching configuration

  const [customSubmitSuccess, setCustomSubmitSuccess] = useState(false);
  const [defaultSubmitSuccess, setDefaultSubmitSuccess] = useState(false);

  // TODO: move translation to separate namespace and remove dependency from notifications
  const translate = useNotificationLocalization();
  const abuseReportsInputsConfiguration = getReportConfiguration(translate);

  const defaultValues = {
    ...abuseReportsInputsConfiguration.reduce(
      (value, config) => ({
        ...value,
        [config.name]: config.initialValue,
      }),
      {},
    ),
    ...defaultFormValues,
  };

  const getEntryPoint = (): EntryPoint => {
    // TODO: remove this dependency to be outside this form??
    const deviceMeta = getNotificationStreamHost().getDeviceMeta();
    if (deviceMeta) {
      const { isInApp, isPhone } = deviceMeta;
      if (isPhone) {
        return "mobile";
      }
      if (isInApp) {
        return "desktop";
      }
    }
    return "website";
  };

  const { control, formState, handleSubmit, register } = useForm<AbuseReportFormData>({
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
  });
  const { isSubmitting, errors, isValid } = formState;

  const generateReportTags = useCallback(
    (data: AbuseReportFormData) => {
      const defaultTags: ReportedTags = {
        SUBMITTER_USER_ID: {
          valueList: [
            {
              data: reporterId,
            },
          ],
        },
        [reportedEntity.key]: {
          valueList: [
            {
              data: reportedEntity.id,
            },
          ],
        },
        REPORTED_ABUSE_VECTOR: {
          valueList: [
            {
              data: reportedEntity.type,
            },
          ],
        },
        ENTRY_POINT: {
          valueList: [
            {
              data: getEntryPoint(),
            },
          ],
        },
      };
      const reportTags = Object.entries(data).reduce((tags, [key, value]) => {
        // eslint-disable-next-line no-param-reassign
        tags[key] = {
          valueList: [
            {
              data: value,
            },
          ],
        };
        return tags;
      }, defaultTags);
      return reportTags;
    },
    [reporterId, reportedEntity],
  );

  const abuseReportDefaultSubmit = useCallback(
    async (data: AbuseReportFormData) => {
      const reportTags = generateReportTags(data);
      return sendReport(reportTags, reportedEntity.idempotenceKey);
    },
    [generateReportTags, reportedEntity],
  );

  const onReportSubmit = useCallback(
    async (data: AbuseReportFormData) => {
      // Make default call
      if (!defaultSubmitSuccess && !onSubmit?.disableDefaultSubmit) {
        sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmit, "click", {
          reportedAbuseVector: reportedEntity.type,
          reportedEntityId: reportedEntity.id,
          entryPoint: getEntryPoint(),
          reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY!,
        });
        try {
          const safetyApiResponse = await abuseReportDefaultSubmit(data);
          sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmitSuccess, "click", {
            reportedAbuseVector: reportedEntity.type,
            reportedEntityId: reportedEntity.id,
            entryPoint: getEntryPoint(),
            reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY!,
            safetyEventId: safetyApiResponse.data.id,
          });
          setDefaultSubmitSuccess(true);
        } catch (e) {
          sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportSubmitFailed, "click", {
            reportedAbuseVector: reportedEntity.type,
            reportedEntityId: reportedEntity.id,
            entryPoint: getEntryPoint(),
            reportedAbuseCategory: data.REPORTED_ABUSE_CATEGORY!,
          });
          setDefaultSubmitSuccess(false);
        }
      }
      if (onSubmit?.action) {
        try {
          await onSubmit?.action(data);
          setCustomSubmitSuccess(true);
        } catch (e) {
          setCustomSubmitSuccess(false);
        }
      }
    },
    [abuseReportDefaultSubmit, defaultSubmitSuccess, onSubmit, reportedEntity],
  );

  useEffect(() => {
    sendEventStreamEvent(ABUSE_REPORT_EVENTS.AbuseReportInitiated, "load", {
      reportedAbuseVector: reportedEntity.type,
      reportedEntityId: reportedEntity.id,
      entryPoint: getEntryPoint(),
    });
  }, []);

  const AbuseReportBody = useMemo(() => {
    const InputItem = getMuiModalArms()?.AbuseReportInputItem ?? "div";
    return abuseReportsInputsConfiguration.map(config => (
      <InputItem key={config.name}>
        <AbuseReportInput
          control={control}
          config={config}
          register={register}
          errors={errors}
          disabled={isSubmitting}
        />
      </InputItem>
    ));
  }, [abuseReportsInputsConfiguration, control, errors, isSubmitting, register]);

  const SubmitSpinner = getFlaggedMuiModalArms()?.SubmitSpinner;

  const AbuseReportActionButtons = useMemo(() => {
    const actionsList =
      formActions?.map(action => (
        <button
          type="button"
          key={action.id}
          data-testid={action.id}
          onClick={action.action}
          className={action.classes}
          disabled={isSubmitting}
        >
          {action.label}
        </button>
      )) ?? [];
    actionsList.push(
      <button
        key="submit"
        type="button"
        data-testid="on-abuse-report-submit"
        className={onSubmit?.classes ?? "btn-primary-lg"}
        disabled={!isValid}
        onClick={handleSubmit(onReportSubmit)}
      >
        {isSubmitting ? (
          SubmitSpinner ? (
            <SubmitSpinner />
          ) : (
            <ProgressCircle
              size="Small"
              variant="Indeterminate"
              ariaLabel={translate("Action.Report")}
            />
          )
        ) : (
          translate("Action.Report")
        )}
      </button>,
    );
    return actionsList;
  }, [
    formActions,
    handleSubmit,
    onReportSubmit,
    onSubmit,
    isSubmitting,
    translate,
    isValid,
    SubmitSpinner,
  ]);

  return customRender ? customRender(AbuseReportBody, AbuseReportActionButtons) : null;
};

export default AbuseReportForm;
