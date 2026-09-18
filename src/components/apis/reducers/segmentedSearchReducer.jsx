import { SegmantedSearchActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const segmentedSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SegmantedSearchActions.SEGMENTED_SEARCH_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SegmantedSearchActions.SEGMENTED_SEARCH_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case SegmantedSearchActions.SEGMENTED_SEARCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
