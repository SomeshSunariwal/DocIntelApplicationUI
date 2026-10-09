import { RegisterUserActions } from "../../constants";

const initialState = { data: [], loading: false, error: null, success: false };

export const registerUserReducer = (state = initialState, action) => {
  switch (action.type) {
    case RegisterUserActions.REGISTER_USER_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case RegisterUserActions.REGISTER_USER_COMPLETED:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
        success: true,
      };
    case RegisterUserActions.REGISTER_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
        success: false,
      };
    default:
      return state;
  }
};
