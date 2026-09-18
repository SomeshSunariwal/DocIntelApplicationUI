import { AISearchActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const aiSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case AISearchActions.AI_SERACH_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case AISearchActions.AI_SERACH_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case AISearchActions.AI_SERACH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
