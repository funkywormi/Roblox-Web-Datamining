import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { SupportMetaData } from "../core/types/serviceMetadataResponse";
import { apiSet } from "../core/constants/services";

const fetchMetadata = async (): Promise<SupportMetaData> => {
  const { data } = await httpService.get<SupportMetaData>(apiSet.fetchMetadata);
  return data;
};

export default fetchMetadata;
