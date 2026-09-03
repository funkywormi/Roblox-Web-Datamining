/**
 * Build the detail-page path for a violation. The detail-page back button relies
 * on real history traversal (inferred from `history.action`), so the path no
 * longer encodes an origin.
 */
export const getDetailPath = (uid: string): string => {
  return `/violations/${encodeURIComponent(uid)}`;
};

/**
 * Build the detail-page path for a submitted report.
 */
export const getReportDetailPath = (id: string): string => {
  return `/report-inbox/${encodeURIComponent(id)}`;
};
