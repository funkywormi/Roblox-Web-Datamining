import { ProgressCircle } from "@rbx/foundation-ui";

type FullScreenLoadingProps = {
  ariaLabel: string;
};

export const FullScreenLoading = ({ ariaLabel }: FullScreenLoadingProps) => {
  return (
    <div
      className="fixed width-full height-full flex items-center justify-center"
      style={{
        zIndex: 1030, // the z-index of top navbar is 1029 and of modals is 1050+. Hence we pick 1030 to show on top of navbar but below modals
        top: 0,
        left: 0,
        backgroundColor: "var(--color-common-backdrop)",
      }}
    >
      <ProgressCircle ariaLabel={ariaLabel} variant="Indeterminate" size="Large" />
    </div>
  );
};
