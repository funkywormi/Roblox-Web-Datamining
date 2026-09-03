import { ReactNode } from "react";
import { ComponentTypes } from "../utils/types";
import ArwpDropdown from "./ArwpDropdown";
import ArwpFreeComment from "./ArwpFreeComment";
import ArwpConfigurableComponentValidationSubtext from "./ArwpConfigurableComponentSubtext";
import ArwpLink from "./ArwpLink";
import ArwpParagraph from "./ArwpParagraph";
import ArwpReminder from "./ArwpReminder";
import ArwpSelector from "./ArwpSelector";

type Props = {
  components: ComponentTypes[];
  formDataKeysWithError: string[];
};

const ArwpConfigurableComponentList = ({ components, formDataKeysWithError }: Props) => {
  const componentList = components
    .map(config => {
      let mainComponent: ReactNode | null = null;

      switch (config.componentType) {
        case "dropdown": {
          const { formDataKey } = config;
          const { items, prompt, placeholder } = config.dropdown;
          mainComponent = (
            <ArwpDropdown
              items={items}
              prompt={prompt}
              placeholder={placeholder}
              formDataKey={formDataKey}
              isErrorState={formDataKeysWithError.includes(formDataKey)}
            />
          );
          break;
        }

        case "freeComment": {
          const { formDataKey } = config;
          const { prompt, placeholder } = config.freeComment;
          mainComponent = (
            <ArwpFreeComment prompt={prompt} placeholder={placeholder} formDataKey={formDataKey} />
          );
          break;
        }

        // For link components, we can just return the AwrpLink component directly.
        case "link": {
          const { url } = config.link;
          return (
            <div className="padding-bottom-medium" key={url}>
              <ArwpLink link={config.link} />
            </div>
          );
        }

        // Paragraphs have simpler structure compared to the other form fields so we can just early return here.
        case "paragraph": {
          const { text, links } = config.paragraph;
          return (
            <div className="padding-bottom-large" key={text}>
              <ArwpParagraph text={text} links={links} />
            </div>
          );
        }

        case "reminder": {
          return (
            <div className="padding-bottom-large" key="reminder">
              <ArwpReminder />
            </div>
          );
        }

        case "selector": {
          const { formDataKey } = config;
          const { prompt } = config.selector;
          return (
            <div key={formDataKey} className="padding-bottom-large">
              <ArwpSelector
                prompt={prompt}
                subtextProps={{
                  isOptional: config.isOptional,
                  requirementMessage: config.requirementMessage,
                  isErrorState: formDataKeysWithError.includes(formDataKey),
                }}
              />
            </div>
          );
        }

        default:
          break;
      }

      return (
        <div className="padding-bottom-large" key={config.formDataKey}>
          {mainComponent}
          <ArwpConfigurableComponentValidationSubtext
            isOptional={config.isOptional}
            requirementMessage={config.requirementMessage}
            isErrorState={formDataKeysWithError.includes(config.formDataKey)}
          />
        </div>
      );
    })
    .filter(Boolean);

  return <div className="configurable-component-list">{componentList}</div>;
};

export default ArwpConfigurableComponentList;
