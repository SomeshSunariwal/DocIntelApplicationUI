import { UserLoginActions } from "../../constants";

const initialState = { data: [], loading: false, error: null };

export const userLoginReducer = (state = initialState, action) => {
  switch (action.type) {
    case UserLoginActions.LOGIN_USER_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UserLoginActions.LOGIN_USER_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
      };
    case UserLoginActions.LOGIN_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
