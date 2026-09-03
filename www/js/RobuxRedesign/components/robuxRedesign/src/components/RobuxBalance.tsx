import { Fragment, useContext, type ComponentProps } from "react";
import classNames from "classnames";
import { Icon } from "@rbx/foundation-ui";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { BuyRobuxPageContext } from "../contexts/BuyRobuxPageContext";

export function RobuxBalance({
  iconSize,
  textClassName,
}: {
  iconSize?: ComponentProps<typeof Icon>["size"];
  textClassName?: string;
}) {
  const { robuxBalance } = useContext(BuyRobuxPageContext);
  if (typeof robuxBalance !== "number") {
    return null;
  }

  return (
    <Fragment>
      <Icon name="icon-filled-robux" size={iconSize} />
      <span className={classNames("font-builder-extended content-action-standard", textClassName)}>
        {formatNumber(robuxBalance)}
      </span>
    </Fragment>
  );
}
