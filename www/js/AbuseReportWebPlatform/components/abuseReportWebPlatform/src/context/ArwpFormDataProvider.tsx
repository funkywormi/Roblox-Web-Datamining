import React, { createContext, useContext, useMemo, useState } from "react";

export type AbuseReportFormData = Map<string, string | number>;
export type ReportTag = {
  TagKey: string;
  // If TagValue is a comma separated string, each value should be separate valueList items in the same report.
  TagValue: string;
};

type FormDataContextProps = {
  formData: AbuseReportFormData;
  setFormData: React.Dispatch<React.SetStateAction<AbuseReportFormData>>;
  additionalReportTags: Map<string, ReportTag>;
  setAdditionalReportTags: React.Dispatch<React.SetStateAction<Map<string, ReportTag>>>;
};

const FormDataContext = createContext<FormDataContextProps | undefined>(undefined);

export const useAbuseReportFormData = (): FormDataContextProps => {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};

type FormDataProviderProps = {
  children: React.JSX.Element;
};

export const ArwpFormDataProvider = ({ children }: FormDataProviderProps) => {
  const [formData, setFormData] = useState<AbuseReportFormData>(new Map());
  const [additionalReportTags, setAdditionalReportTags] = useState<Map<string, ReportTag>>(
    new Map(),
  );
  const value = useMemo(
    () => ({
      formData,
      setFormData,
      additionalReportTags,
      setAdditionalReportTags,
    }),
    [formData, additionalReportTags],
  );

  return <FormDataContext.Provider value={value}>{children}</FormDataContext.Provider>;
};
