import { TPunishment, CommutationEligibility } from "../utils/types";
import { usePageNavigation } from "../context/PageNavigationContext";

type Props = {
  punishmentData: TPunishment;
  commutationEligibility?: CommutationEligibility;
};

/**
 * Since most page items on the Not Approved Page are independent info that are shown/hidden
 * depending on the details of the punishment specifications, we are using this config based
 * system to keep things standardized and organized.
 *
 * Each config involves getIsVisible() and renderComponent to determine
 * when to show/hide, and what to render depending on the punishment data.
 *
 * A config is a file under the pageItemConfigs folder that determines what to show based on the
 * PunishmentData. Each config specifies when a certain part of content should be visible, and the
 * render logic.
 *
 * All of the configs are invoked under each page, but only the ones that return true for getIsVisible
 * will be rendered.
 */
const PageItemsFromConfigs = ({ punishmentData, commutationEligibility }: Props): JSX.Element => {
  const { isFirstPage, currentPageConfigs, currentPageName } = usePageNavigation();

  const pageItemsContent = currentPageConfigs
    .map(config => {
      if (!config.getIsVisible(punishmentData, currentPageName, commutationEligibility)) {
        return null;
      }

      const PageItemComponent = config.renderComponent;
      return (
        <div key={config.configName}>
          <PageItemComponent punishmentData={punishmentData} />
        </div>
      );
    })
    .filter(Boolean);

  return (
    <div className={`flex flex-col ${!isFirstPage ? "gap-[36px]" : "gap-xlarge"}`}>
      {pageItemsContent}
    </div>
  );
};

export default PageItemsFromConfigs;
