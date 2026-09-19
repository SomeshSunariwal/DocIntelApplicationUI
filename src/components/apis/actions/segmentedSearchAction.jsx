import { SegmantedSearchActions } from "../../constants";

export const segmentedSearchAction = (query) => {
  return {
    type: SegmantedSearchActions.SEGMENTED_SEARCH_REQUESTED,
    payload: query,
  };
};
