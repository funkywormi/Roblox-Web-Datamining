import React from "react";
import classNames from "classnames";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

interface TiltBackedIconProps {
  name: TTailwindIconClass;
  size?: number;
}

const TiltBackedIcon: React.FC<TiltBackedIconProps> = ({ name }) => {
  return (
    <div className="relative flex justify-center items-center width-[115px] height-[115px]">
      <div className="absolute width-full height-full stroke-standard stroke-default rotate-15" />
      <span className={classNames(name, `icon width-[72px] height-[72px]`)} />
    </div>
  );
};

export default TiltBackedIcon;
