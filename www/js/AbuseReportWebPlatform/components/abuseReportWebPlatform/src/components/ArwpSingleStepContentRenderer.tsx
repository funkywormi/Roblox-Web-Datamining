import { BeduiInnerContentConfigType } from "../utils/types";
import { CONTENT_TYPES } from "../utils/constants";
import ArwpConfigurableComponentList from "./ArwpConfigurableComponentList";

type Props = {
  contentConfig: BeduiInnerContentConfigType | null;
  formDataKeysWithError: string[];
};

const ArwpSingleStepContentRenderer = ({ contentConfig, formDataKeysWithError }: Props) => {
  if (!contentConfig) {
    return null;
  }

  const { type } = contentConfig;
  if (type === CONTENT_TYPES.TREE_SELECTION) {
    // TODO (richardli) add tree selection component when introduced
    return null;
  }
  if (type === CONTENT_TYPES.CONFIGURABLE_COMPONENT_LIST) {
    const { components } = contentConfig.configurableComponentList;
    return (
      <ArwpConfigurableComponentList
        components={components}
        formDataKeysWithError={formDataKeysWithError}
      />
    );
  }
  return <div />;
};

export default ArwpSingleStepContentRenderer;
