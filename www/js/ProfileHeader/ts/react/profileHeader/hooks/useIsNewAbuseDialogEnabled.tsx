import useExperiments from './useExperiments';

const useIsNewAbuseDialogEnabled = (): boolean => {
  const { data: ixpData } = useExperiments('Safety.AbuseReportDialog', false);
  return Boolean(ixpData && !!ixpData.enableARDialog);
};

export default useIsNewAbuseDialogEnabled;
