import { GetUserAIConfigActions } from "../../constants";

const initialState = { data: null, loading: false, error: null };

export const getUserAIConfigReducer = (state = initialState, action) => {
  switch (action.type) {
    case GetUserAIConfigActions.GET_USER_AI_CONFIG_REQUESTED:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetUserAIConfigActions.GET_USER_AI_CONFIG_COMPLETED:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case GetUserAIConfigActions.GET_USER_AI_CONFIG_ERROR:
      return {
        ...state,
        loading: false,
        error: action.message,
      };
    default:
      return state;
  }
};
