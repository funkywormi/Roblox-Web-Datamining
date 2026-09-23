import { Icon, TIconProps } from "@rbx/foundation-ui";
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";

type Props = {
  legacyClass: string;
  name: TIconProps["name"];
  size?: TIconProps["size"];
  id?: string;
  /** Applied in both arms, for layout classes the surrounding legacy CSS keys off. */
  className?: string;
  /** Applied only in the foundation arm, for tokens that replace what the sprite class provided. */
  foundationClassName?: string;
};

export default function NavIcon({
  legacyClass,
  name,
  size,
  id,
  className,
  foundationClassName,
}: Props) {
  const isFoundation = useIsTopNavFoundation();

  if (isFoundation) {
    // Foundation's Icon leaves vertical-align at baseline; the legacy sprites set middle, and the
    // nav rows are sized around that.
    return (
      <Icon
        name={name}
        size={size}
        id={id}
        className={["[vertical-align:middle]", className, foundationClassName]
          .filter(Boolean)
          .join(" ")}
      />
    );
  }

  return <span className={[legacyClass, className].filter(Boolean).join(" ")} id={id} />;
}
