import React, { Dispatch, SetStateAction, useEffect } from "react";

export type HighlightableElementProps = {
  children: React.ReactElement;
  setIsHighlighted: Dispatch<SetStateAction<boolean>>;
  isHighlighted: boolean;
};

export const HighlightableElement: React.FC<HighlightableElementProps> = ({
  children,
  setIsHighlighted,
  isHighlighted,
}: HighlightableElementProps): JSX.Element => {
  useEffect(() => {
    const handleUserClickAnywhere = (event: MouseEvent) => {
      // Only remove the highlight on left click.
      if (event.button === 0) {
        setIsHighlighted(false);
        document.removeEventListener("mousedown", handleUserClickAnywhere);
      }
    };
    document.addEventListener("mousedown", handleUserClickAnywhere);

    return () => {
      document.removeEventListener("mousedown", handleUserClickAnywhere);
    };
  });

  const injectedChildren = React.Children.map(children, child => (
    <div className={isHighlighted ? "highlight" : "highlight highlight-transition"}>{child}</div>
  ));
  return <React.Fragment>{injectedChildren}</React.Fragment>;
};
