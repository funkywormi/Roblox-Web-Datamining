import { TextArea } from "@rbx/foundation-ui";
import { useAbuseReportFormData } from "../context/ArwpFormDataProvider";

interface ArwpFreeCommentProps {
  prompt: string;
  placeholder: string;
  formDataKey: string;
}

const ArwpFreeComment = ({ prompt, placeholder, formDataKey }: ArwpFreeCommentProps) => {
  const { formData, setFormData } = useAbuseReportFormData();
  return (
    <TextArea
      size="Medium"
      label={prompt}
      placeholder={placeholder}
      value={String(formData.get(formDataKey) ?? "")}
      onChange={event => {
        const newFormDataMap = new Map(formData);
        newFormDataMap.set(formDataKey, event.target.value);
        setFormData(newFormDataMap);
      }}
      textareaStyle={{ resize: "vertical" }}
    />
  );
};

export default ArwpFreeComment;
