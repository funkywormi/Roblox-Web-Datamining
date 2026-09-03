import { EducationSection } from "../../types/api";
import EducationContentList from "./education/EducationContentList";

const ReportEducation = ({ section }: { section: EducationSection }) => {
  return (
    <div className="flex flex-col gap-medium">
      <span className="text-heading-small">{section.title}</span>
      <div className="flex flex-col gap-medium bg-shift-100 radius-medium padding-medium">
        <EducationContentList items={section.items} />
      </div>
    </div>
  );
};

export default ReportEducation;
