import React from "react";
import { Button } from "@rbx/foundation-ui";
import { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import TiltBackedIcon from "./TiltBackedIcon";

interface InfoPanelProps {
  iconName: TTailwindIconClass;
  heading: string;
  message: string;
  href?: string;
  buttonText?: string;
  onClick?: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  iconName,
  heading,
  message,
  href,
  buttonText,
  onClick,
}) => {
  return (
    <div className="flex justify-center width-full">
      <div className="flex flex-col items-center max-width-[480px] margin-top-medium">
        <TiltBackedIcon name={iconName} />
        <div className="text-heading-medium text-align-x-center margin-top-medium">{heading}</div>
        <div className="text-body-medium margin-top-small text-align-x-center">{message}</div>
        {(href ?? onClick) && (
          <Button
            className="margin-top-medium"
            type="button"
            variant="Emphasis"
            as={href ? "a" : "button"}
            href={href}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
