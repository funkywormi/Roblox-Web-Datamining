import { TFilterOption } from "../../common/types/bedev2Types";

const getOptionContextTag = (
  selectedOptionId: string | undefined,
  filterOptions: TFilterOption[],
): string | undefined => {
  if (!selectedOptionId) {
    return undefined;
  }
  const option = filterOptions.find(option => option.optionId === selectedOptionId);
  return option?.optionContextTag !== "" ? option?.optionContextTag : undefined;
};

export default getOptionContextTag;
