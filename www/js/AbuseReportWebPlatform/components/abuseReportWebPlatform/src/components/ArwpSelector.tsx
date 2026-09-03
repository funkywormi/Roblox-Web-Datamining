import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@rbx/foundation-ui";
import { Thumbnail2d, ThumbnailAssetsSize } from "@rbx/thumbnails";
import { useSearchParams } from "../context/ArwpUrlParamProvider";
import { ABUSE_VECTOR_PLACE, SELECTOR_TAG_KEYS } from "../utils/constants";
import { useAbuseReportFormData } from "../context/ArwpFormDataProvider";
import { getPlaceMediaAssetIds } from "../utils/getPlaceMediaAssetIds";
import ArwpConfigurableComponentSubtext, {
  ArwpConfigurableComponentSubtextProps,
} from "./ArwpConfigurableComponentSubtext";

const updateMap = <T,>(prevData: Map<string, T>, key: string, value: T): Map<string, T> => {
  const newMap = new Map(prevData);
  newMap.set(key, value);
  return newMap;
};

/**
 * Selector is a unique component that draws its rendering from what the frontend provides.
 * It is responsible for displaying the appropriate UI elements based on the current state and props.
 * Currently, it is used for:
 * - Place reports: selecting thumbnails to send to the image asset queue
 */

interface ArwpSelectorProps {
  prompt: string;
  subtextProps: ArwpConfigurableComponentSubtextProps;
}

const ArwpSelector = ({ prompt, subtextProps }: ArwpSelectorProps) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState(new Set());
  const { setAdditionalReportTags } = useAbuseReportFormData();
  const { abuseVector, customParams } = useSearchParams();
  const uniqueId = useRef(`selector-${Date.now()}`);

  const { data: assetIds } = useQuery({
    queryKey: ["placeSelectorAssetIds", abuseVector, customParams?.stringId],
    // Query only runs if `customParams?.stringId != null`
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    queryFn: () => getPlaceMediaAssetIds(customParams!.stringId!),
    enabled: abuseVector === ABUSE_VECTOR_PLACE && customParams?.stringId != null,
  });

  useEffect(() => {
    setSelectedAssetIds(new Set());
  }, [abuseVector, customParams?.stringId, assetIds]);

  if (assetIds == null || assetIds.length === 0) {
    return null;
  }

  const toggleAssetId = (assetId: number) => {
    setSelectedAssetIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(assetId)) {
        newSelected.delete(assetId);
      } else {
        newSelected.add(assetId);
      }
      // Update sameReportFormData or separateReportFormData with the new selected assets
      if (abuseVector === ABUSE_VECTOR_PLACE) {
        const formDataValue = Array.from(newSelected.values()).join(",");
        setAdditionalReportTags(prevFormData =>
          updateMap(prevFormData, uniqueId.current, {
            TagKey: SELECTOR_TAG_KEYS.ABUSE_VECTOR_PLACE,
            TagValue: formDataValue,
          }),
        );
      }
      return newSelected;
    });
  };

  return (
    <div className="bg-surface-100 width-full padding-medium gap-small radius-medium flex flex-col">
      <div>{prompt}</div>
      <div
        className="width-full gap-xlarge grid"
        style={{
          gridTemplateColumns: "repeat(1, minmax(50px, 0.5fr))",
        }}
      >
        {/* Render a list of selector labels with checkboxes. Each label is clickable and keyboard accessible. */}
        {assetIds.map(assetId => (
          // Because this is a visual image selection, we don't provide image labels for accessiblity.
          // It would also be hard / non-trivial to generate labels/descriptions for each thumbnail.
          //
          // TODO: fix the list of components marked as controls in the lint
          // eslint-disable-next-line jsx-a11y/label-has-associated-control
          <label className="items-center justify-center gap-medium flex" key={assetId}>
            <Checkbox
              label=""
              size="Medium"
              placement="Start"
              onCheckedChange={() => {
                toggleAssetId(assetId);
              }}
              isChecked={selectedAssetIds.has(assetId)}
            />
            <Thumbnail2d
              key={assetId}
              targetId={assetId}
              type="Asset"
              size={ThumbnailAssetsSize.size150}
              containerClass="cursor-pointer"
            />
          </label>
        ))}
      </div>
      <ArwpConfigurableComponentSubtext
        isOptional={subtextProps.isOptional}
        requirementMessage={subtextProps.requirementMessage}
        isErrorState={subtextProps.isErrorState}
      />
    </div>
  );
};

export default ArwpSelector;
