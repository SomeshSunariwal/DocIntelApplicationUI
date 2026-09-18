import { DeleteUserActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const deleteUserReducer = (state = initialState, action) => {
  switch (action.type) {
    case DeleteUserActions.DELETE_USER_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case DeleteUserActions.DELETE_USER_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case DeleteUserActions.DELETE_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
