import React from "react";

interface PreviewCardDescriptionProps {
  description: string;
}
/* 
  To be used inside of a PreviewCard to provide a message or description
*/
export const PreviewCardDescription: React.FC<PreviewCardDescriptionProps> = ({ description }) => {
  return <div className="text-description preview-card-description">{description}</div>;
};

export default PreviewCardDescription;
