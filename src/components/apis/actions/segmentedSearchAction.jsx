import { SegmantedSearchActions } from "../../constants";

export const segmentedSearchAction = (searchData) => {
  return {
    type: SegmantedSearchActions.SEGMENTED_SEARCH_REQUESTED,
    payload: searchData,
  };
};
