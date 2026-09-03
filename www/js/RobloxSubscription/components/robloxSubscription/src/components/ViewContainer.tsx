import type { FC, PropsWithChildren } from "react";

const ViewContainer: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <div className="clip-x margin-bottom-[160px] min-height-[400px] padding-top-[16px] large:margin-bottom-[120px] relative">
      {children}
    </div>
  );
};

export default ViewContainer;
