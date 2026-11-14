import React, { FC } from "react";
import { Controller } from "react-hook-form";
import { TextArea } from "@rbx/foundation-ui";
import { useNotificationLocalization } from "../context/NotificationsLocalization";
import { AbuseReportInputProps } from "./abuseReportFormType";
import { REPORTER_COMMENT_LIMIT } from "./constants/abuseReportConstants";
import { getFlaggedMuiModalArms } from "../mui/muiModalArms";

const AbuseReportInput: FC<AbuseReportInputProps> = ({
  control,
  config,
  errors,
  register,
  disabled,
}) => {
  // TODO: move translation to separate namespace and remove dependency from notifications
  const translate = useNotificationLocalization();

  const getHelperText = (
    error: Partial<{ type: string | number; message: string }> | undefined,
  ) => {
    if (error && error.type === "required") {
      return translate("Error.FieldRequired");
    }
    if (error && error.type === "maxLength") {
      return translate("Error.MaxLength.AbuseReporterComment", {
        maxLength: REPORTER_COMMENT_LIMIT,
      });
    }
    return undefined;
  };

  if (config.type === "textfield") {
    const MuiTextField = getFlaggedMuiModalArms()?.AbuseReportTextField;
    return (
      <Controller
        name={config.name as never}
        control={control}
        rules={config.validation}
        render={({ field: { onChange, onBlur, value, ref } }) =>
          MuiTextField ? (
            <MuiTextField
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              id={config.name}
              inputRef={ref}
              placeholder={config.placeHolder}
              hasError={!!errors[config.name]}
              helperText={getHelperText(errors[config.name])}
              disabled={disabled}
            />
          ) : (
            <TextArea
              value={value as string}
              onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>}
              id={config.name}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              placeholder={config.placeHolder}
              hasError={!!errors[config.name]}
              rows={6}
              required
              helperText={getHelperText(errors[config.name])}
              isDisabled={disabled}
              className="width-full"
            />
          )
        }
      />
    );
  }
  if (config.type === "select") {
    // using native select because MUI select has issues with windows webview
    return (
      <React.Fragment>
        <label className="text-label" htmlFor={config.name}>
          {config.label}
        </label>
        <div className="rbx-select-group select-group">
          <select
            {...register(config.name, config.validation)}
            className="input-field rbx-select select-option select-label"
            id={config.name}
            disabled={disabled}
          >
            {config.options?.map(menuOption => (
              <option key={menuOption.label} value={menuOption.value}>
                {menuOption.label}
              </option>
            ))}
          </select>
          <span className="icon-arrow icon-down-16x16" />
        </div>
      </React.Fragment>
    );
  }
  return null;
};

export default AbuseReportInput;
