import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { MetadataResponse } from './types';
import { getMetadata } from './services';

const GET_METADATA_KEY = 'getIllegalContentReportMetadata';

const useGetMetadata = (): UseQueryResult<MetadataResponse, Error> => {
  return useQuery({ queryKey: [GET_METADATA_KEY], queryFn: getMetadata });
};

export default useGetMetadata;
