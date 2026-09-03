import { IconButton } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";

interface PageHeaderProps {
  title: string;
  onBack?: () => void;
}

const PageHeader = ({ title, onBack }: PageHeaderProps) => {
  const { translate } = useTranslation();

  return (
    <div className="flex items-center gap-small padding-bottom-small">
      {onBack && (
        <IconButton
          icon="icon-filled-chevron-large-left"
          onClick={onBack}
          ariaLabel={translate("Label.Back")}
          size="Medium"
          variant="Utility"
          // The leading icon has padding we want to offset for visual alignment, but we don't want to get rid of the padding on the icon for a neater hover effect.
          className="ltr:margin-left-[-12px] rtl:margin-right-[-12px] rtl:[transform:scaleX(-1)]"
        />
      )}
      <h1 className="text-heading-large">{title}</h1>
    </div>
  );
};

export default PageHeader;
