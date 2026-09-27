import { UserVerifyActions } from "../../constants";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const userVerifyReducer = (state = initialState, action) => {
  switch (action.type) {
    case UserVerifyActions.USER_VERIFY_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UserVerifyActions.USER_VERIFY_COMPLETED:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case UserVerifyActions.USER_VERIFY_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
