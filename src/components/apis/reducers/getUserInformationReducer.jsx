import { GetUserInformationActions } from "../../constants";

const initialState = { data: null, loading: false, error: null };

export const getUserInformationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GetUserInformationActions.GET_USER_INFORMATION_REQUESTED:
      return {
        ...state,
        data: null,
        loading: true,
        error: null,
      };
    case GetUserInformationActions.GET_USER_INFORMATION_COMPLETED:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case GetUserInformationActions.GET_USER_INFORMATION_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
