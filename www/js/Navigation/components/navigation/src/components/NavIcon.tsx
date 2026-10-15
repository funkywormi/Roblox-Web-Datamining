import { Icon, TIconProps } from "@rbx/foundation-ui";

type Props = {
  name: TIconProps["name"];
  size?: TIconProps["size"];
  id?: string;
  className?: string;
};

export default function NavIcon({ name, size, id, className }: Props) {
  // Foundation's Icon leaves vertical-align at baseline; the nav rows are sized around middle.
  return (
    <Icon
      name={name}
      size={size}
      id={id}
      className={["[vertical-align:middle]", className].filter(Boolean).join(" ")}
    />
  );
}
